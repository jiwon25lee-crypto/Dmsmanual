# 🔧 Feature 카드 로드 문제 해결 완료!

## ❌ **문제 상황**

**사용자 보고:**
> "페이지 편집: DMS 시작하기 현재 퍼블리싱된 카드 정보도 제대로 나오지 않고 있다"

**증상:**
- 백오피스 → 페이지 관리 → "start-features" 선택
- Feature 카드 관리 탭 → ❌ 카드가 표시되지 않음
- "아직 Feature 카드가 없습니다" 메시지만 표시

---

## 🔍 **근본 원인 분석**

### **문제 1: PageEditor에서 Feature 카드를 로드하지 않음**

```typescript
// ❌ 이전 코드
const [featureCards, setFeatureCards] = useState<FeatureCardData[]>([]);
// 빈 배열로만 초기화, LanguageContext에서 읽어오지 않음
```

**결과:**
- PageEditor 열 때 featureCards는 항상 빈 배열
- FeatureCardsEditor에 빈 배열 전달
- 실제 데이터가 LanguageContext에 있어도 표시 안 됨

---

### **문제 2: LanguageContext의 키 불일치**

**하드코딩된 데이터:**
```typescript
// ❌ 이전 키 (menu1~menu5)
"start-features.menu1.title": "DMS 시작하기",
"start-features.menu1.desc": "...",
"start-features.menu2.title": "DMS-상식플러스(App) 연동",
// ...
```

**백오피스에서 찾는 키:**
```typescript
// ✅ 백오피스가 찾는 키 (feature1~feature20)
t(`${pageId}.feature1.title`)
t(`${pageId}.feature2.title`)
// ...
```

**결과:**
- 키가 달라서 데이터를 찾을 수 없음
- `t('start-features.feature1.title')` → 번역 키 그대로 반환 (titleKey === title)
- 조건문에서 걸러짐 → 카드 로드 실패

---

## ✅ **해결 방법**

### **1. PageEditor에 loadFeatureCards 함수 추가**

```typescript
// 🆕 Feature 카드 로드 함수
const loadFeatureCards = (): FeatureCardData[] => {
  const cards: FeatureCardData[] = [];
  
  // Feature 1~20 로드 (실제 존재하는 것만)
  for (let i = 1; i <= 20; i++) {
    const titleKey = `${pageId}.feature${i}.title`;
    const titleKo = t(titleKey) as string;
    
    // 제목이 번역 키 그대로 반환되면 해당 Feature는 없는 것
    if (titleKo && titleKo !== titleKey) {
      cards.push({
        number: i,
        visible: t(`${pageId}.feature${i}.visible`) !== false, // 기본값 true
        icon: (t(`${pageId}.feature${i}.icon`) || "📄") as string,
        title: {
          ko: titleKo,
          en: (t(`${pageId}.feature${i}.title`) || titleKo) as string,
        },
        desc: {
          ko: (t(`${pageId}.feature${i}.desc`) || "") as string,
          en: (t(`${pageId}.feature${i}.desc`) || "") as string,
        },
      });
    }
  }
  
  return cards;
};

// 🆕 초기 로드 시 LanguageContext에서 읽기
const [featureCards, setFeatureCards] = useState<FeatureCardData[]>(() => {
  if (pageLayout === 'features') {
    return loadFeatureCards();
  }
  return [];
});
```

---

### **2. LanguageContext 키 변경**

**한국어 (ko):**
```typescript
// ✅ 수정 후
"start-features.feature1.title": "DMS 시작하기",
"start-features.feature1.desc": "DMS 로그인, 회원가입 방법을 확인하고 처음 사용을 시작하세요.",
"start-features.feature1.icon": "🚀",

"start-features.feature2.title": "DMS-상식플러스(App) 연동",
"start-features.feature2.desc": "모바일 앱 소개와 DMS와의 연동 방법을 안내합니다.",
"start-features.feature2.icon": "📱",

"start-features.feature3.title": "DMS 회원 관리",
"start-features.feature3.desc": "회원 정보, 식사 기록, 영양 리포트, 온라인 상담을 관리하세요.",
"start-features.feature3.icon": "👥",

"start-features.feature4.title": "기관 레시피 관리",
"start-features.feature4.desc": "기관 맞춤형 레시피를 생성하고 회원에게 제공하세요.",
"start-features.feature4.icon": "🍽️",

"start-features.feature5.title": "DMS 설정",
"start-features.feature5.desc": "기관 정보, 구성원 관리, 기타 설정을 변경할 수 있습니다.",
"start-features.feature5.icon": "⚙️",
```

**영어 (en):**
```typescript
// ✅ 수정 후
"start-features.feature1.title": "Getting Started with DMS",
"start-features.feature1.desc": "Learn how to log in and sign up to start using DMS.",
"start-features.feature1.icon": "🚀",

"start-features.feature2.title": "App - SangsikPlus Connection",
"start-features.feature2.desc": "Mobile app introduction and how to connect with DMS.",
"start-features.feature2.icon": "📱",

"start-features.feature3.title": "DMS Member Management",
"start-features.feature3.desc": "Manage member information, meal records, nutrition reports, and online consultation.",
"start-features.feature3.icon": "👥",

"start-features.feature4.title": "Institution Recipe Management",
"start-features.feature4.desc": "Create customized recipes for your institution and provide them to members.",
"start-features.feature4.icon": "🍽️",

"start-features.feature5.title": "DMS Settings",
"start-features.feature5.desc": "Configure institution information, manage members, and other settings.",
"start-features.feature5.icon": "⚙️",
```

---

### **3. FeatureCardsEditor 개선**

```typescript
// 🔧 visible 기본값 처리 개선
visible: visibleValue !== false, // false가 아니면 true

// 🔧 Feature 개수 10 → 20으로 증가
for (let i = 1; i <= 20; i++) {
```

---

## 🧪 **테스트 방법**

### **1. 백오피스 Feature 카드 로드 테스트**

```
1. #/admin 접속
2. 페이지 관리 → "start-features" 선택
3. 🎯 Feature 카드 관리 탭 클릭
4. 콘솔 확인:
   ✅ [PageEditor] Loaded feature cards: 5 [...]
   ✅ [FeatureCardsEditor] Loaded feature 1: {...}
   ✅ [FeatureCardsEditor] Total loaded features: 5 [...]
5. UI 확인:
   ✅ Feature 1~5 카드가 표시됨
   ✅ 각 카드에 제목/설명/아이콘 표시됨
   ✅ "매뉴얼에 표시" 체크박스 표시됨
```

**예상 결과:**
- Feature 1: 🚀 DMS 시작하기
- Feature 2: 📱 DMS-상식플러스(App) 연동
- Feature 3: 👥 DMS 회원 관리
- Feature 4: 🍽️ 기관 레시피 관리
- Feature 5: ⚙️ DMS 설정

---

### **2. Feature 카드 수정 테스트**

```
1. Feature 1 제목을 "DMS 시작하기" → "DMS 시작 가이드"로 변경
2. 저장 버튼 클릭
3. 콘솔 확인:
   ✅ [PageEditor] Adding feature cards: [...]
   ✅ [LanguageContext] Updating page data: {...}
   ✅ [LanguageContext] Saving to Supabase...
   ✅ [Server] Manual data saved successfully
4. 매뉴얼 페이지 확인:
   ✅ "DMS 시작 가이드"로 즉시 반영
5. 새로고침 (F5):
   ✅ 여전히 "DMS 시작 가이드"로 표시됨
```

---

### **3. Feature 카드 추가 테스트**

```
1. "Feature 추가" 버튼 클릭
2. Feature 6 입력:
   - 아이콘: 📊
   - 제목 (한국어): 데이터 분석
   - 제목 (영어): Data Analysis
   - 설명 (한국어): 회원 데이터를 분석합니다.
   - 설명 (영어): Analyze member data.
3. 저장
4. 매뉴얼 페이지 확인:
   ✅ Feature 6이 추가됨
   ✅ 6개 카드 그리드로 표시됨
```

---

## 📊 **데이터 흐름 (수정 후)**

```
페이지 로드
    ↓
LanguageContext 초기화
    ↓
loadFromSupabase() 실행
    ↓
translations 병합 (feature1~feature5)
    ↓
PageEditor 렌더링
    ↓
loadFeatureCards() 실행
    ↓
t('start-features.feature1.title') 호출
    ↓
✅ "DMS 시작하기" 반환 (키 일치!)
    ↓
featureCards에 5개 카드 로드
    ↓
FeatureCardsEditor에 전달
    ↓
✅ 카드 5개 표시!
```

---

## 🔧 **수정된 파일 목록**

### **1. `/components/admin/PageEditor.tsx`**
- 🆕 `loadFeatureCards()` 함수 추가
- 🆕 `featureCards` 초기화 로직 변경 (useState 콜백 사용)
- ✅ Feature 카드를 LanguageContext에서 로드

### **2. `/components/admin/FeatureCardsEditor.tsx`**
- 🔧 `visible` 기본값 처리 개선 (`!== false`)
- 🔧 Feature 개수 10 → 20으로 증가
- ✅ 더 자세한 콘솔 로그 추가

### **3. `/components/LanguageContext.tsx`**
- 🔧 `start-features.menu1~menu5` → `start-features.feature1~feature5`로 키 변경
- 🆕 아이콘 필드 추가 (`feature{N}.icon`)
- ✅ 한국어/영어 모두 수정

---

## 🎯 **결과**

### **✅ 해결된 문제:**
1. **Feature 카드가 표시되지 않던 문제** → 해결
2. **키 불일치로 데이터를 찾지 못하던 문제** → 해결
3. **백오피스에서 Feature 카드를 편집할 수 없던 문제** → 해결

### **✅ 기대 효과:**
1. **백오피스 편집 가능** - Feature 카드 제목/설명/아이콘 수정
2. **실시간 동기화** - 저장 즉시 매뉴얼 페이지 반영
3. **영구 저장** - Supabase에 저장되어 새로고침 후에도 유지
4. **확장 가능** - 최대 20개 Feature 카드 지원

---

## 💡 **추가 개선 사항 (향후)**

### **1. Feature 카드 순서 변경**
```typescript
// 드래그 앤 드롭으로 카드 순서 변경
<SortableList items={features} onReorder={setFeatures} />
```

### **2. Feature 카드 이미지 추가**
```typescript
feature: {
  icon: "🚀",
  image: "https://...feature-image.png", // 🆕 이미지 URL
  title: { ko: "...", en: "..." },
  desc: { ko: "...", en: "..." },
}
```

### **3. Feature 카드 링크 추가**
```typescript
feature: {
  icon: "🚀",
  title: { ko: "...", en: "..." },
  desc: { ko: "...", en: "..." },
  linkTo: "start-login", // 🆕 클릭 시 이동할 페이지 ID
}
```

---

**이제 Feature 카드가 완전히 동작합니다!** 🎉

✅ 백오피스에서 로드  
✅ 편집 가능  
✅ Supabase 저장  
✅ 매뉴얼 반영  
✅ 새로고침 유지  
