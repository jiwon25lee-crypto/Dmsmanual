# 🎯 남은 구현 단계

## ✅ **완료된 작업**

### **1. 페이지 메타데이터 시스템** ✅
```typescript
// LanguageContext.tsx
- PageLayout 타입 정의
- initialPageMetadata 추가
- getPageLayout() 함수
- setPageLayout() 함수
```

### **2. 별도 편집 컴포넌트 생성** ✅
```
✅ /components/admin/FeatureCardsEditor.tsx
   - Feature 카드 로드, 추가, 삭제, 수정
   - LanguageContext 자동 로드

✅ /components/admin/TabContentEditor.tsx
   - Overview/Features/Guide 탭 편집
   - LanguageContext 자동 로드
```

### **3. PageEditor 동적 탭 구성** ✅
```typescript
// PageEditor.tsx
- 레이아웃 감지
- 동적 탭 표시
- FeatureCardsEditor, TabContentEditor import
```

---

## 🚧 **진행 필요한 작업**

### **Phase 1: LanguageContext에 저장 로직 추가** (중요!)

#### **위치:** `/components/LanguageContext.tsx`의 `updatePageData()` 함수

#### **추가할 코드:**

```typescript
// 기존 Step 데이터 업데이트 코드 아래에 추가:

// 🆕 Feature 카드 데이터 업데이트
if (data.featureCards && Array.isArray(data.featureCards)) {
  data.featureCards.forEach((feature: any) => {
    const featureNum = feature.number;
    
    // 한국어
    if (feature.title?.ko) {
      translations.ko[`${pageId}.feature${featureNum}.title`] = feature.title.ko;
    }
    if (feature.desc?.ko) {
      translations.ko[`${pageId}.feature${featureNum}.desc`] = feature.desc.ko;
    }
    
    // 영어
    if (feature.title?.en) {
      translations.en[`${pageId}.feature${featureNum}.title`] = feature.title.en;
    }
    if (feature.desc?.en) {
      translations.en[`${pageId}.feature${featureNum}.desc`] = feature.desc.en;
    }
    
    // 아이콘 (언어 공통)
    if (feature.icon !== undefined) {
      translations.ko[`${pageId}.feature${featureNum}.icon`] = feature.icon;
      translations.en[`${pageId}.feature${featureNum}.icon`] = feature.icon;
    }
    
    // Visibility (언어 공통)
    if (feature.visible !== undefined) {
      commonVisibility[`${pageId}.feature${featureNum}.visible`] = feature.visible;
    }
  });
}

// 🆕 TabContent 데이터 업데이트
if (data.tabContent) {
  const tc = data.tabContent;
  
  // Overview 탭
  if (tc.overview) {
    if (tc.overview.title?.ko) {
      translations.ko[`${pageId}.overview.title`] = tc.overview.title.ko;
    }
    if (tc.overview.title?.en) {
      translations.en[`${pageId}.overview.title`] = tc.overview.title.en;
    }
    if (tc.overview.desc?.ko) {
      translations.ko[`${pageId}.overview.desc`] = tc.overview.desc.ko;
    }
    if (tc.overview.desc?.en) {
      translations.en[`${pageId}.overview.desc`] = tc.overview.desc.en;
    }
    if (tc.overview.image !== undefined) {
      translations.ko[`${pageId}.overview.image`] = tc.overview.image;
      translations.en[`${pageId}.overview.image`] = tc.overview.image;
    }
  }
  
  // Features 탭
  if (tc.features && Array.isArray(tc.features)) {
    tc.features.forEach((feature: any) => {
      const featureNum = feature.number;
      
      if (feature.title?.ko) {
        translations.ko[`${pageId}.features.feature${featureNum}.title`] = feature.title.ko;
      }
      if (feature.title?.en) {
        translations.en[`${pageId}.features.feature${featureNum}.title`] = feature.title.en;
      }
      if (feature.desc?.ko) {
        translations.ko[`${pageId}.features.feature${featureNum}.desc`] = feature.desc.ko;
      }
      if (feature.desc?.en) {
        translations.en[`${pageId}.features.feature${featureNum}.desc`] = feature.desc.en;
      }
      if (feature.icon !== undefined) {
        translations.ko[`${pageId}.features.feature${featureNum}.icon`] = feature.icon;
        translations.en[`${pageId}.features.feature${featureNum}.icon`] = feature.icon;
      }
      if (feature.visible !== undefined) {
        commonVisibility[`${pageId}.features.feature${featureNum}.visible`] = feature.visible;
      }
    });
  }
  
  // Guide 탭
  if (tc.guide && Array.isArray(tc.guide)) {
    tc.guide.forEach((step: any) => {
      const stepNum = step.number;
      
      if (step.title?.ko) {
        translations.ko[`${pageId}.guide.step${stepNum}.title`] = step.title.ko;
      }
      if (step.title?.en) {
        translations.en[`${pageId}.guide.step${stepNum}.title`] = step.title.en;
      }
      if (step.desc?.ko) {
        translations.ko[`${pageId}.guide.step${stepNum}.desc`] = step.desc.ko;
      }
      if (step.desc?.en) {
        translations.en[`${pageId}.guide.step${stepNum}.desc`] = step.desc.en;
      }
      if (step.image !== undefined) {
        translations.ko[`${pageId}.guide.step${stepNum}.image`] = step.image;
        translations.en[`${pageId}.guide.step${stepNum}.image`] = step.image;
      }
      if (step.visible !== undefined) {
        commonVisibility[`${pageId}.guide.step${stepNum}.visible`] = step.visible;
      }
    });
  }
}
```

**삽입 위치:**
```
line 2415: // Step 데이터 업데이트
line 2450: } // Step 업데이트 끝

👉 line 2450 아래에 위 코드 추가
```

---

### **Phase 2: MenuManager에 레이아웃 선택 추가**

#### **위치:** `/components/admin/MenuManager.tsx`

#### **필요한 수정:**

1. **Select 컴포넌트 import 추가:**
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
```

2. **레이아웃 state 추가:**
```typescript
const [newSubMenuLayout, setNewSubMenuLayout] = useState<PageLayout>("default");
```

3. **신규 소메뉴 생성 폼에 레이아웃 선택 추가:**
```typescript
<div>
  <Label>페이지 레이아웃</Label>
  <Select
    value={newSubMenuLayout}
    onValueChange={(value) => setNewSubMenuLayout(value as PageLayout)}
  >
    <SelectTrigger>
      <SelectValue placeholder="레이아웃 선택" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="default">
        📋 기본 레이아웃 (Step 넘버링)
      </SelectItem>
      <SelectItem value="features">
        🎯 Feature 카드 그리드
      </SelectItem>
      <SelectItem value="tabs">
        📑 탭 레이아웃 (Overview/Features/Guide)
      </SelectItem>
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground mt-1">
    💡 생성 후에는 레이아웃을 변경할 수 없습니다.
  </p>
</div>
```

4. **소메뉴 생성 시 레이아웃 설정:**
```typescript
const handleAddSubMenu = () => {
  // ... 기존 코드 ...
  
  // 🆕 레이아웃 설정
  setPageLayout(newSubMenuId, newSubMenuLayout);
  
  // 🆕 레이아웃에 따른 초기 데이터 생성
  if (newSubMenuLayout === "default") {
    // Step 1 초기화
    updatePageData(newSubMenuId, {
      title: { ko: newSubMenuName.ko, en: newSubMenuName.en },
      intro: { ko: "", en: "" },
      guideTitle: { ko: "가이드", en: "Guide" },
      steps: [],
    });
  } else if (newSubMenuLayout === "features") {
    // Feature 카드 초기화
    updatePageData(newSubMenuId, {
      title: { ko: newSubMenuName.ko, en: newSubMenuName.en },
      intro: { ko: "", en: "" },
      featureCards: [],
    });
  } else if (newSubMenuLayout === "tabs") {
    // TabContent 초기화
    updatePageData(newSubMenuId, {
      title: { ko: newSubMenuName.ko, en: newSubMenuName.en },
      intro: { ko: "", en: "" },
      tabContent: {
        overview: { title: { ko: "", en: "" }, desc: { ko: "", en: "" }, image: "" },
        features: [],
        guide: [],
      },
    });
  }
  
  // ... 기존 코드 ...
  
  // 🆕 레이아웃 state 초기화
  setNewSubMenuLayout("default");
};
```

---

### **Phase 3: PageEditor 데이터 전달 수정**

#### **위치:** `/components/admin/PageEditor.tsx`

#### **현재 문제:**
```typescript
// ❌ 잘못된 코드 (컴파일 에러 발생)
<TabsContent value="features" className="space-y-4">
  <FeatureCardsEditor
    pageId={pageId}
    onFeatureCardsChange={(featureCards) => {
      setPageData({
        ...pageData,
        featureCards: featureCards, // ❌ pageData에 featureCards 타입이 없음
      });
    }}
  />
</TabsContent>
```

#### **해결 방법:**

**옵션 1: pageData에 필드 추가 (권장)**
```typescript
// loadPageData() 함수 수정
const loadPageData = () => {
  const data: any = { // ← any 타입으로 변경
    title: { ... },
    intro: { ... },
    // ... 기존 필드들 ...
    steps: [] as StepData[],
  };
  
  // ... 기존 Step 로드 코드 ...
  
  // 🆕 레이아웃에 따라 추가 데이터 로드
  if (pageLayout === 'features') {
    data.featureCards = []; // FeatureCardsEditor가 자동 로드
  } else if (pageLayout === 'tabs') {
    data.tabContent = { // TabContentEditor가 자동 로드
      overview: { title: { ko: "", en: "" }, desc: { ko: "", en: "" }, image: "" },
      features: [],
      guide: [],
    };
  }
  
  return data;
};

// state에서 저장
const [pageData, setPageData] = useState<any>(loadPageData());
```

**옵션 2: 별도 state 사용**
```typescript
const [featureCards, setFeatureCards] = useState<FeatureCardData[]>([]);
const [tabContent, setTabContent] = useState<TabContentData | null>(null);

// 저장 시 병합
const handleSave = () => {
  const dataToSave: any = { ...pageData };
  
  if (pageLayout === 'features') {
    dataToSave.featureCards = featureCards;
  } else if (pageLayout === 'tabs') {
    dataToSave.tabContent = tabContent;
  }
  
  updatePageData(pageId, dataToSave);
  // ...
};
```

---

## 🧪 **테스트 시나리오**

### **1. StartFeaturesPage 편집 테스트**
```
1. 백오피스 → 페이지 관리 → start-features 선택
2. "🎯 Feature 카드 관리" 탭 확인
3. Feature 추가/삭제/수정
4. 저장 후 매뉴얼에서 확인
```

### **2. TabPage 편집 테스트**
```
1. 백오피스 → 페이지 관리 → member-dashboard 선택
2. "📑 탭 컨텐츠 관리" 탭 확인
3. Overview/Features/Guide 탭 편집
4. 저장 후 매뉴얼에서 확인
```

### **3. 신규 메뉴 생성 테스트**
```
1. 백오피스 → 메뉴 관리
2. 소메뉴 추가
3. 레이아웃 선택 드롭다운 확인
4. Features 레이아웃 선택 후 생성
5. 페이지 편집에서 Feature 카드 관리 탭 확인
```

---

## 📝 **구현 체크리스트**

### **Phase 1: 저장 로직**
- [ ] LanguageContext.tsx의 updatePageData에 Feature 카드 저장 로직 추가
- [ ] TabContent 저장 로직 추가
- [ ] 저장 후 콘솔 로그 확인

### **Phase 2: 레이아웃 선택**
- [ ] MenuManager에 Select 컴포넌트 import
- [ ] 레이아웃 선택 드롭다운 추가
- [ ] 신규 메뉴 생성 시 setPageLayout 호출
- [ ] 레이아웃별 초기 데이터 생성

### **Phase 3: PageEditor 수정**
- [ ] pageData 타입을 any로 변경 또는 별도 state 추가
- [ ] featureCards, tabContent 데이터 전달
- [ ] 저장 시 데이터 병합

### **Phase 4: 통합 테스트**
- [ ] Start-features 편집 테스트
- [ ] Member-dashboard 편집 테스트
- [ ] 신규 메뉴 생성 테스트
- [ ] 저장 후 매뉴얼 반영 확인

---

## 🎯 **최종 목표 달성 현황**

```
✅ Phase 0: 레이아웃 감지 시스템
✅ Phase 1: Feature 카드 관리 UI (컴포넌트 완성)
✅ Phase 2: 탭 컨텐츠 관리 UI (컴포넌트 완성)
🚧 Phase 3: LanguageContext 저장 로직 (진행 중)
🚧 Phase 4: MenuManager 레이아웃 선택 (진행 중)
🚧 Phase 5: PageEditor 데이터 연동 (진행 중)
```

---

## 💡 **중요 참고사항**

1. **LanguageContext 파일이 매우 큼 (2500+ lines)**
   - 직접 편집 필요
   - Line 2450 근처에 코드 추가

2. **PageEditor도 큼 (600+ lines)**
   - pageData 타입을 `any`로 변경하는 것이 가장 간단
   - 또는 별도 state 관리

3. **컴파일 에러 주의**
   - featureCards, tabContent 필드가 없다는 에러 발생 가능
   - 타입 정의 수정 필요

4. **테스트는 start-features, member-dashboard 페이지로**
   - 이미 레이아웃이 설정된 페이지들
   - 즉시 테스트 가능

---

**다음 단계를 진행하시겠습니까?** 😊
