# 🐛 Admin ↔ Front 동기화 디버깅 가이드

작성일: 2025-11-26

---

## 🔍 문제 상황

**테스트 결과:** Admin과 Front 여전히 동기화 안됨

### Front (왼쪽 이미지)
- 제목: "서비스 공지사항"
- 여러 공지사항 표시됨

### Admin (오른쪽 이미지)
- 페이지 ID: `notice-1111`
- 제목 (한국어): "1111"
- 날짜 (한국어): "2024.01.01"
- 내용 (한국어): "121212121212"

→ **완전히 다른 데이터 표시** ❌

---

## 🛠️ 적용된 수정 사항

### 1. LanguageContext에 updateTrigger 추가 ✅
```typescript
// /components/LanguageContext.tsx
interface LanguageContextType {
  // ... 기존 속성들
  updateTrigger: number; // 🆕 추가
}

// Provider value에 포함
const contextValue = useMemo(() => ({
  // ... 기존 속성들
  updateTrigger, // 🆕 추가
}), [language, t, updateTranslation, saveToSupabase, updateTrigger]);
```

### 2. PageEditor에서 updateTrigger 사용 ✅
```typescript
// /components/admin/PageEditor.tsx
const { updateTrigger } = useLanguage(); // 🆕 추가

useEffect(() => {
  // 데이터 리로드
}, [pageId, updateTrigger]); // ✅ t 대신 updateTrigger
```

### 3. 디버깅 로그 추가 ✅
```typescript
useEffect(() => {
  console.log('[PageEditor] ========== useEffect TRIGGERED ==========');
  console.log('[PageEditor] pageId:', pageId);
  console.log('[PageEditor] updateTrigger:', updateTrigger);
  
  const testTitle = getTranslation(`${pageId}.title`, 'ko');
  console.log('[PageEditor] Current title from LanguageContext:', testTitle);
  
  // ...
}, [pageId, updateTrigger]);
```

---

## 🧪 디버깅 절차

### Step 1: 브라우저 콘솔 열기

1. Admin 페이지 열기
2. F12 키를 눌러 개발자 도구 열기
3. Console 탭 선택

---

### Step 2: 초기 로드 로그 확인

**예상 로그:**
```
[LanguageContext] Loading data from Supabase...
[LanguageContext] Data loaded from Supabase: { translations: { ko: {...}, en: {...} } }
[LanguageContext] Translations loaded (replaced)
[LanguageContext] Loading complete, setting isLoading to false
[Custom Event] translations-updated { source: 'load' }

[PageEditor] ========== useEffect TRIGGERED ==========
[PageEditor] pageId: notice-1111
[PageEditor] updateTrigger: 1 (또는 더 큰 숫자)
[PageEditor] Current title from LanguageContext: "서비스 공지사항"
[PageEditor] freshData.title.ko: "서비스 공지사항"
[PageEditor] ========== Data reload COMPLETE ==========
```

**확인 사항:**
- [ ] `[LanguageContext] Loading data from Supabase...` 메시지가 나타나는가?
- [ ] `[LanguageContext] Data loaded from Supabase` 메시지가 나타나는가?
- [ ] `[PageEditor] useEffect TRIGGERED` 메시지가 나타나는가?
- [ ] `Current title from LanguageContext`의 값이 Front와 일치하는가?
- [ ] `freshData.title.ko`의 값이 Front와 일치하는가?

---

### Step 3: 문제별 진단

#### 케이스 1: LanguageContext 로드 안됨
```
❌ [LanguageContext] Loading data from Supabase... 메시지 없음
```

**원인:**
- Supabase 연결 실패
- Edge Function 오류

**해결:**
1. Network 탭에서 `/manual/load` 요청 확인
2. Response 상태 코드 확인 (200 OK?)
3. Response 본문 확인

---

#### 케이스 2: PageEditor useEffect 실행 안됨
```
✅ [LanguageContext] Data loaded...
❌ [PageEditor] useEffect TRIGGERED 메시지 없음
```

**원인:**
- PageEditor가 마운트되지 않음
- useEffect 의존성 배열 문제

**해결:**
1. PageEditor 컴포넌트가 렌더링되는지 확인
2. updateTrigger 값이 변경되는지 확인

---

#### 케이스 3: getTranslation이 잘못된 값 반환
```
✅ [LanguageContext] Data loaded...
✅ [PageEditor] useEffect TRIGGERED
❌ Current title from LanguageContext: "1111" (잘못된 값)
```

**원인:**
- getTranslation 함수가 최신 데이터를 참조하지 않음
- translations 객체가 업데이트되지 않음

**해결:**
1. getTranslation 함수 구현 확인
2. translations 객체가 제대로 업데이트되는지 확인

**테스트 코드:**
```javascript
// 콘솔에서 직접 실행
const { translations } = window.__LANGUAGE_CONTEXT__;
console.log('notice-1111.title:', translations.ko['notice-1111.title']);
```

---

#### 케이스 4: loadPageData가 클로저 문제로 초기값만 참조
```
✅ [LanguageContext] Data loaded...
✅ [PageEditor] useEffect TRIGGERED
✅ Current title from LanguageContext: "서비스 공지사항"
❌ freshData.title.ko: "1111" (잘못된 값)
```

**원인:**
- `loadPageData()` 함수가 클로저로 초기 `getTranslation`만 참조
- 함수가 useEffect 외부에 정의되어 있어서 업데이트 안됨

**해결:**
`loadPageData` 함수를 useEffect 내부로 이동

---

## 🔧 추가 수정 (필요 시)

### 수정 1: getTranslation에 updateTrigger 의존성 추가

**파일:** `/components/LanguageContext.tsx`

```typescript
const getTranslation = useCallback((key: string, lang: Language): string | boolean | undefined => {
  if (key.endsWith(".visible") || key.endsWith(".image-visible")) {
    return commonVisibility[key] ?? true;
  }
  return translations[lang][key];
}, [updateTrigger]); // ✅ updateTrigger 의존성 추가
```

---

### 수정 2: loadPageData를 useCallback으로 감싸기

**파일:** `/components/admin/PageEditor.tsx`

```typescript
const loadPageData = useCallback(() => {
  const data = {
    title: {
      ko: (getTranslation(`${pageId}.title`, 'ko') || "") as string,
      en: (getTranslation(`${pageId}.title`, 'en') || "") as string,
    },
    // ... 나머지
  };
  return data;
}, [pageId, getTranslation]); // ✅ 의존성 추가
```

---

### 수정 3: loadPageData를 useEffect 내부로 이동 (가장 확실)

**파일:** `/components/admin/PageEditor.tsx`

```typescript
useEffect(() => {
  console.log('[PageEditor] useEffect TRIGGERED');
  
  // ✅ 함수를 useEffect 내부에서 직접 정의
  const loadData = () => {
    return {
      title: {
        ko: (getTranslation(`${pageId}.title`, 'ko') || "") as string,
        en: (getTranslation(`${pageId}.title`, 'en') || "") as string,
      },
      // ... 나머지
    };
  };
  
  const freshData = loadData();
  setPageData(freshData);
  
}, [pageId, updateTrigger, getTranslation]);
```

---

## 📝 디버깅 체크리스트

실제 Admin 페이지를 열고 다음을 확인하세요:

### 초기 로드
- [ ] 콘솔에 `[LanguageContext] Loading data from Supabase...` 표시
- [ ] 콘솔에 `[LanguageContext] Data loaded from Supabase` 표시
- [ ] 콘솔에 `[PageEditor] useEffect TRIGGERED` 표시
- [ ] `updateTrigger` 값이 0 이상 (예: 1, 2, 3...)
- [ ] `Current title from LanguageContext` 값이 Front와 일치

### 페이지 선택 시
- [ ] 다른 페이지 선택 시 `useEffect TRIGGERED` 다시 표시
- [ ] 새 페이지의 데이터가 제대로 로드됨

### 저장 후
- [ ] 저장 버튼 클릭 시 `Saving to Supabase...` 표시
- [ ] 저장 성공 시 `Saved to Supabase successfully` 표시
- [ ] Front 새로고침 시 변경사항 반영

---

## 🚨 긴급 우회 방법

위의 모든 방법이 실패할 경우, **강제 새로고침 버튼** 추가:

```typescript
// PageEditor.tsx
<Button
  onClick={() => {
    window.location.reload();
  }}
>
  🔄 새로고침
</Button>
```

**사용법:**
1. 메뉴 관리에서 페이지 선택
2. 데이터가 이상하면 "새로고침" 버튼 클릭
3. 페이지가 다시 로드되면서 Supabase에서 최신 데이터 가져옴

---

## 📊 다음 단계

1. **콘솔 로그 스크린샷 공유**
   - Admin 페이지 열었을 때 콘솔 로그 전체
   - 특히 `[PageEditor]` 로그

2. **Network 탭 확인**
   - `/manual/load` 요청이 성공했는지
   - Response 내용이 올바른지

3. **실제 값 확인**
   ```javascript
   // 콘솔에서 실행
   console.log('notice-1111.title:', 
     window.languageContext?.getTranslation?.('notice-1111.title', 'ko')
   );
   ```

---

**다음 회신 시 포함해 주세요:**
1. 콘솔 로그 전체 (특히 [PageEditor] 관련)
2. Admin에서 보이는 제목 값
3. Front에서 보이는 제목 값
4. Network 탭의 /manual/load 응답

이 정보를 바탕으로 정확한 원인을 파악하고 해결하겠습니다!

---

**작성자: AI Assistant**  
**작성일: 2025-11-26**
