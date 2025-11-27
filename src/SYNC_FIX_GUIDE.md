# 🔧 Admin ↔ Front 데이터 동기화 문제 해결 가이드

작성일: 2025-11-26

---

## 🚨 문제 상황

1. **Admin에서 저장 → Front 반영 안됨**
   - Admin에서 변경사항 저장
   - Front 페이지를 새로고침해도 변경사항이 보이지 않음

2. **Front 상태 → Admin 반영 안됨**
   - Front에서 현재 보이는 데이터
   - Admin에서 편집할 때 다른 데이터가 보임

---

## 🔍 원인 분석

### 1. **saveToSupabase의 의존성 배열 문제** ✅ 해결됨

**문제:**
```typescript
// ❌ 빈 의존성 배열
const saveToSupabase = useCallback(async () => {
  body: JSON.stringify({
    translations,  // ← 초기값만 참조
    commonVisibility,  // ← 초기값만 참조
    pageMetadata,  // ← 초기값만 참조
  }),
}, []); // ← 빈 배열!
```

**결과:**
- Admin에서 아무리 수정해도 **초기값만 Supabase에 저장됨**
- 변경사항이 저장되지 않음

**해결:**
```typescript
// ✅ 의존성 배열에 추가
const saveToSupabase = useCallback(async () => {
  body: JSON.stringify({
    translations,  // ← 최신값 참조
    commonVisibility,  // ← 최신값 참조
    pageMetadata,  // ← 최신값 참조
  }),
}, [translations, commonVisibility, pageMetadata]); // ✅ 의존성 추가!
```

---

### 2. **translations가 let이 아닌 const로 선언됨**

**문제:**
```typescript
const translations: Record<Language, Record<string, string | boolean>> = {
  ko: { /* 초기 데이터 */ },
  en: { /* 초기 데이터 */ },
};
```

**결과:**
- `translations.ko`와 `translations.en`의 **참조는 변경되지 않음**
- 객체 내부 속성만 변경됨 (`translations.ko["key"] = "value"`)
- React의 의존성 추적이 제대로 작동하지 않을 수 있음

**해결 방법 1: useState로 변경 (권장)**
```typescript
const [translations, setTranslations] = useState({
  ko: { /* 초기 데이터 */ },
  en: { /* 초기 데이터 */ },
});

// 업데이트 시
setTranslations(prev => ({
  ...prev,
  ko: { ...prev.ko, [key]: value }
}));
```

**해결 방법 2: useRef + updateTrigger (현재 방식)**
```typescript
// 현재 코드는 updateTrigger로 리렌더링 강제
const [updateTrigger, setUpdateTrigger] = useState(0);

// 업데이트 시
translations.ko[key] = value;
setUpdateTrigger(prev => prev + 1); // ← 강제 리렌더링
```

---

### 3. **초기 로드 시 이벤트 미발생**

**문제:**
```typescript
// ❌ 데이터 로드 후 이벤트 없음
if (data.translations) {
  translations.ko = data.translations.ko;
  translations.en = data.translations.en;
}
setUpdateTrigger(prev => prev + 1);
// 이벤트 없음!
```

**결과:**
- Admin이 Supabase에서 데이터를 로드해도
- Front 페이지에서 감지하지 못함

**해결:**
```typescript
// ✅ 데이터 로드 후 이벤트 발생
if (data.translations) {
  translations.ko = data.translations.ko;
  translations.en = data.translations.en;
}
setUpdateTrigger(prev => prev + 1);

// ✅ 이벤트 발생
window.dispatchEvent(new CustomEvent('translations-updated', { 
  detail: { source: 'load' } 
}));
```

---

## ✅ 해결 방법

### 수정 1: saveToSupabase 의존성 배열 수정 ✅

**파일:** `/components/LanguageContext.tsx` (line 2769)

```typescript
// Before
const saveToSupabase = useCallback(async () => {
  // ...
}, []); // ❌

// After
const saveToSupabase = useCallback(async () => {
  // ...
}, [translations, commonVisibility, pageMetadata]); // ✅
```

---

### 수정 2: 저장 성공 시 이벤트 발생 ✅

**파일:** `/components/LanguageContext.tsx` (line 2790)

```typescript
if (response.ok) {
  const result = await response.json();
  console.log('[LanguageContext] ✅ Saved to Supabase successfully:', result);
  
  // ✅ 저장 성공 후 이벤트 발생
  window.dispatchEvent(new CustomEvent('translations-updated', { 
    detail: { 
      source: 'save', 
      timestamp: new Date().toISOString(),
    } 
  }));
  
  return true;
}
```

---

### 수정 3: 초기 로드 시 이벤트 발생 ✅

**파일:** `/components/LanguageContext.tsx` (line 2446)

```typescript
// 리렌더링 트리거
setUpdateTrigger(prev => prev + 1);

// ✅ 데이터 로드 완료 이벤트 발생
window.dispatchEvent(new CustomEvent('translations-updated', { 
  detail: { 
    source: 'load', 
    timestamp: new Date().toISOString(),
  } 
}));
```

---

## 🧪 테스트 시나리오

### 시나리오 1: Admin → Front 동기화

```
1. Admin 페이지 열기
2. "로그인 관리자" 페이지 선택
3. 제목 수정: "관리자 로그인" → "시스템 관리자 로그인"
4. "저장" 버튼 클릭
5. 콘솔 확인:
   ✅ [LanguageContext] Saving to Supabase...
   ✅ [LanguageContext] ✅ Saved to Supabase successfully
6. 새 탭에서 Manual 페이지 열기
7. 사이드바에서 "로그인 > 시스템 관리자 로그인" 선택
8. 제목이 "시스템 관리자 로그인"으로 표시됨 ✅
```

---

### 시나리오 2: Front → Admin 동기화

```
1. Manual 페이지 열기
2. 현재 표시되는 제목: "관리자 로그인"
3. Admin 페이지 열기
4. "로그인 관리자" 페이지 선택
5. PageEditor에서 현재 제목이 "관리자 로그인"으로 표시됨 ✅
```

---

## 🔍 디버깅 체크리스트

### Admin에서 저장 시
```
✅ [LanguageContext] Updating translation: { key: "login-admin.title", value: "..." }
✅ [LanguageContext] Page data updated successfully
✅ [LanguageContext] Saving to Supabase... { translationsKoKeys: 200, ... }
✅ [LanguageContext] ✅ Saved to Supabase successfully
✅ [Custom Event] translations-updated { source: 'save' }
```

### Front에서 로드 시
```
✅ [LanguageContext] Loading data from Supabase...
✅ [LanguageContext] Data loaded from Supabase
✅ [LanguageContext] Translations loaded (replaced)
✅ [LanguageContext] Loading complete
✅ [Custom Event] translations-updated { source: 'load' }
✅ [ManualContent] Translations updated: { source: 'load' }
✅ [ManualContent] Re-rendering...
```

---

## ⚠️ 여전히 문제가 있다면

### 1. **브라우저 캐시 문제**

**증상:**
- Admin에서 저장했는데 Front에 반영 안됨
- 콘솔에는 "Saved successfully" 나옴

**해결:**
```
1. Ctrl + Shift + R (강제 새로고침)
2. 개발자 도구 > Application > Storage > Clear site data
3. 브라우저 재시작
```

---

### 2. **Supabase 저장 실패**

**증상:**
- 콘솔에 "Save failed" 또는 에러 메시지

**확인:**
```typescript
// 콘솔에서 수동으로 테스트
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-8aea8ee5/manual/save`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ translations: {}, commonVisibility: {}, pageMetadata: {} }),
  }
);

console.log(await response.text());
```

**해결:**
- Supabase 프로젝트 상태 확인
- API 키 확인 (`/utils/supabase/info.tsx`)
- Edge Function 로그 확인

---

### 3. **이벤트 리스너 미등록**

**증상:**
- Admin에서 저장해도 Front가 반응 없음

**확인:**
```typescript
// ManualContent.tsx에서 이벤트 리스너 등록 확인
useEffect(() => {
  const handleTranslationsUpdate = (event: any) => {
    console.log('[ManualContent] Translations updated:', event.detail);
    setRefreshKey(prev => prev + 1);
  };

  window.addEventListener('translations-updated', handleTranslationsUpdate);
  
  return () => {
    window.removeEventListener('translations-updated', handleTranslationsUpdate);
  };
}, []);
```

---

## 📊 데이터 흐름 다이어그램

### Admin → Supabase → Front

```
[Admin PageEditor]
    ↓ updatePageData()
[LanguageContext: translations.ko[key] = value]
    ↓ "저장" 버튼 클릭
[LanguageContext: saveToSupabase()]
    ↓ POST /manual/save
[Supabase Edge Function]
    ↓ kv_store.set()
[Supabase Database: kv_store 테이블]
    ↓ 저장 성공
[LanguageContext: dispatchEvent('translations-updated')]
    ↓
[ManualContent: useEffect 감지]
    ↓ setRefreshKey()
[DefaultPage: key={refreshKey} → 리렌더링]
    ↓
[화면에 변경사항 반영] ✅
```

---

### Front 초기 로드

```
[Front 페이지 열기]
    ↓
[LanguageContext: useEffect()]
    ↓ loadFromSupabase()
    ↓ GET /manual/load
[Supabase Edge Function]
    ↓ kv_store.get()
[Supabase Database: kv_store 테이블]
    ↓ 데이터 반환
[LanguageContext: translations.ko = data.ko]
    ↓ setUpdateTrigger()
    ↓ dispatchEvent('translations-updated')
[ManualContent: useEffect 감지]
    ↓ setRefreshKey()
[DefaultPage: 최신 데이터로 렌더링] ✅
```

---

## ✅ 최종 확인

### 수정 완료 파일
- ✅ `/components/LanguageContext.tsx` (line 2769, 2790, 2446)

### 변경 사항
1. ✅ `saveToSupabase` 의존성 배열에 `translations`, `commonVisibility`, `pageMetadata` 추가
2. ✅ 저장 성공 시 `translations-updated` 이벤트 발생
3. ✅ 초기 로드 완료 시 `translations-updated` 이벤트 발생
4. ✅ 저장 시 로그에 키 개수 출력

### 예상 결과
- ✅ Admin에서 저장 → Supabase에 최신 데이터 저장
- ✅ Front 새로고침 → Supabase에서 최신 데이터 로드
- ✅ Admin과 Front 간 완벽한 동기화

---

**작성자: AI Assistant**  
**작성일: 2025-11-26**  
**적용 완료: 2025-11-26**
