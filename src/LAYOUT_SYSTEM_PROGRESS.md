# 🎯 레이아웃 시스템 구현 진행 상황

## ✅ **완료된 작업**

### **1. 페이지 메타데이터 시스템 구축**

```typescript
// LanguageContext.tsx

// 레이아웃 타입 정의
export type PageLayout = "default" | "features" | "tabs" | "accordion";

// 페이지 메타데이터
const initialPageMetadata: Record<string, PageMetadata> = {
  // Features 레이아웃
  "start-features": { layout: "features" },
  "start-intro": { layout: "features" },
  
  // Tabs 레이아웃
  "member-dashboard": { layout: "tabs" },
  
  // Default 레이아웃 (대부분)
  "login-admin": { layout: "default" },
  // ... 나머지 모든 페이지
};
```

**기능:**
- ✅ 각 페이지의 레이아웃 타입 저장
- ✅ `getPageLayout(pageId)` - 레이아웃 가져오기
- ✅ `setPageLayout(pageId, layout)` - 레이아웃 설정 (신규 메뉴 생성 시)

---

### **2. PageEditor 동적 탭 구성**

```typescript
// PageEditor.tsx

const pageLayout = getPageLayout(pageId);

<TabsList>
  <TabsTrigger value="basic">📝 기본 정보</TabsTrigger>
  
  {pageLayout === 'default' && (
    <TabsTrigger value="steps">📋 Step 관리</TabsTrigger>
  )}
  
  {pageLayout === 'features' && (
    <TabsTrigger value="features">🎯 Feature 카드 관리</TabsTrigger>
  )}
  
  {pageLayout === 'tabs' && (
    <TabsTrigger value="tab-content">📑 탭 컨텐츠 관리</TabsTrigger>
  )}
</TabsList>
```

**기능:**
- ✅ 레이아웃 감지
- ✅ 레이아웃에 따라 탭 동적 표시
- ✅ 불필요한 탭 숨김

---

## 🚧 **진행 중인 작업 (다음 단계)**

### **Phase 1: Feature 카드 관리 UI 추가**

StartFeaturesPage용 편집 UI를 구현해야 합니다.

```typescript
// 필요한 인터페이스
interface FeatureCardData {
  number: number;
  visible: boolean;
  title: { ko: string; en: string };
  desc: { ko: string; en: string };
  icon: string;
}

// 필요한 UI
<TabsContent value="features" className="space-y-4">
  <div className="flex justify-between items-center">
    <h3>Feature 카드 목록</h3>
    <Button onClick={addFeatureCard}>
      <Plus className="w-4 h-4 mr-2" />
      Feature 추가
    </Button>
  </div>

  {features.map((feature, index) => (
    <Card key={index}>
      <CardHeader>
        <CardTitle>Feature {feature.number}</CardTitle>
        <label>
          <input type="checkbox" checked={feature.visible} />
          매뉴얼에 표시
        </label>
      </CardHeader>
      <CardContent>
        {/* 제목 입력 */}
        {/* 설명 입력 */}
        {/* 아이콘 입력 */}
      </CardContent>
    </Card>
  ))}
</TabsContent>
```

---

### **Phase 2: 탭 컨텐츠 관리 UI 추가**

TabPage용 편집 UI를 구현해야 합니다.

```typescript
// 필요한 인터페이스
interface TabContentData {
  overview: {
    title: { ko: string; en: string };
    desc: { ko: string; en: string };
    image: string;
  };
  features: FeatureCardData[];
  guide: StepData[];
}

// 필요한 UI
<TabsContent value="tab-content" className="space-y-4">
  <Tabs value={activeContentTab}>
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="features">Features</TabsTrigger>
      <TabsTrigger value="guide">Guide</TabsTrigger>
    </TabsList>

    <TabsContent value="overview">
      {/* Overview 탭 컨텐츠 편집 */}
    </TabsContent>
    
    <TabsContent value="features">
      {/* Features 탭 컨텐츠 편집 */}
    </TabsContent>
    
    <TabsContent value="guide">
      {/* Guide 탭 컨텐츠 편집 */}
    </TabsContent>
  </Tabs>
</TabsContent>
```

---

### **Phase 3: MenuManager 신규 메뉴 생성 시 레이아웃 선택**

신규 메뉴 생성 시 레이아웃을 선택할 수 있는 드롭다운을 추가해야 합니다.

```typescript
// MenuManager.tsx

<Label>페이지 레이아웃</Label>
<Select
  value={newMenuLayout}
  onValueChange={setNewMenuLayout}
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
      📑 탭 레이아웃
    </SelectItem>
  </SelectContent>
</Select>
```

**기능:**
- 신규 메뉴 생성 시 레이아웃 선택
- 선택한 레이아웃으로 페이지 초기화
- `setPageLayout(pageId, layout)` 호출

---

## 📋 **구현 세부 사항**

### **Feature 카드 데이터 구조**

```typescript
// LanguageContext.tsx - 번역 키 구조

ko: {
  "start-features.feature1.title": "회원 관리",
  "start-features.feature1.desc": "구성원을 초대하고 관리합니다",
  "start-features.feature1.icon": "👥",
}

// commonVisibility
{
  "start-features.feature1.visible": true,
}
```

---

### **탭 컨텐츠 데이터 구조**

```typescript
// LanguageContext.tsx - 번역 키 구조

ko: {
  // Overview 탭
  "member-dashboard.overview.title": "회원 대시보드 개요",
  "member-dashboard.overview.desc": "회원 관리 기능을 한눈에...",
  "member-dashboard.overview.image": "https://...",
  
  // Features 탭
  "member-dashboard.features.feature1.title": "회원 목록 조회",
  "member-dashboard.features.feature1.desc": "등록된 회원을 조회...",
  
  // Guide 탭
  "member-dashboard.guide.step1.title": "대시보드 접속",
  "member-dashboard.guide.step1.desc": "회원 메뉴를 클릭...",
}
```

---

## 🎯 **다음 단계**

### **우선순위:**

1. ✅ **Phase 0: 레이아웃 감지 시스템** (완료)
2. 🚧 **Phase 1: Feature 카드 관리 UI** (진행 중)
   - PageEditor에 Feature 탭 추가
   - Feature 카드 CRUD
   - LanguageContext 연동
3. 🚧 **Phase 2: 탭 컨텐츠 관리 UI** (대기)
   - PageEditor에 탭 컨텐츠 탭 추가
   - Overview/Features/Guide 편집
   - LanguageContext 연동
4. 🚧 **Phase 3: MenuManager 레이아웃 선택** (대기)
   - 신규 메뉴 생성 폼에 레이아웃 드롭다운 추가
   - 레이아웃 선택 → 페이지 초기화
   - setPageLayout 연동

---

## 🔍 **현재 상황**

### **완료:**
```
✅ LanguageContext에 pageMetadata 추가
✅ PageLayout 타입 정의
✅ getPageLayout() 함수
✅ setPageLayout() 함수
✅ PageEditor 동적 탭 구성
✅ 레이아웃 감지 로그
```

### **진행 중:**
```
🚧 Feature 카드 관리 UI
   ├─ 데이터 로드 로직
   ├─ Feature 카드 CRUD
   └─ 저장 로직

🚧 탭 컨텐츠 관리 UI
   ├─ 데이터 로드 로직
   ├─ 탭별 편집 UI
   └─ 저장 로직

🚧 MenuManager 레이아웃 선택
   ├─ 드롭다운 UI
   ├─ 레이아웃 초기화
   └─ setPageLayout 연동
```

---

## 💡 **구현 가이드**

### **Feature 카드 로드 로직**

```typescript
// PageEditor.tsx - loadPageData()

// Feature 1~10 로드 (실제 존재하는 것만)
const features: FeatureCardData[] = [];
for (let i = 1; i <= 10; i++) {
  const titleKey = `${pageId}.feature${i}.title`;
  const title = t(titleKey) as string;
  
  if (title && title !== titleKey) {
    features.push({
      number: i,
      visible: t(`${pageId}.feature${i}.visible`) === true,
      title: {
        ko: title,
        en: title,
      },
      desc: {
        ko: (t(`${pageId}.feature${i}.desc`) || "") as string,
        en: (t(`${pageId}.feature${i}.desc`) || "") as string,
      },
      icon: (t(`${pageId}.feature${i}.icon`) || "🎯") as string,
    });
  }
}
```

---

### **Feature 카드 저장 로직**

```typescript
// updatePageData() 확장 필요

// Feature 데이터 업데이트
if (data.features && Array.isArray(data.features)) {
  data.features.forEach((feature: any) => {
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
    
    // Visibility
    if (feature.visible !== undefined) {
      commonVisibility[`${pageId}.feature${featureNum}.visible`] = feature.visible;
    }
  });
}
```

---

## 🎉 **최종 목표**

### **레이아웃별 완전한 편집 지원:**

```
DefaultPage (기본 레이아웃):
  ├─ 📝 기본 정보
  └─ 📋 Step 관리 (완료 ✅)

StartFeaturesPage (Feature 카드):
  ├─ 📝 기본 정보 (완료 ✅)
  └─ 🎯 Feature 카드 관리 (진행 중 🚧)
      ├─ 카드 추가/삭제
      ├─ 제목/설명/아이콘 편집
      └─ 표시/숨김 제어

TabPage (탭 레이아웃):
  ├─ 📝 기본 정보 (완료 ✅)
  └─ 📑 탭 컨텐츠 관리 (진행 중 🚧)
      ├─ Overview 탭 편집
      ├─ Features 탭 편집
      └─ Guide 탭 편집
```

### **신규 메뉴 생성:**

```
MenuManager:
  ├─ 소메뉴 ID 입력
  ├─ 소메뉴 이름 입력
  └─ 📋 페이지 레이아웃 선택 (신규 추가 🚧)
      ├─ 기본 레이아웃
      ├─ Feature 카드 그리드
      └─ 탭 레이아웃
```

---

## 📝 **참고사항**

### **레이아웃 변경 불가:**

```
✅ 신규 메뉴 생성 시: 레이아웃 선택 가능
❌ 기존 메뉴 편집 시: 레이아웃 변경 불가

이유:
- 레이아웃 변경 시 데이터 구조가 완전히 바뀜
- 기존 데이터 손실 방지
- 단순화된 구현
```

### **기본 레이아웃:**

```
신규 메뉴 생성 시 레이아웃 미선택 → "default" 자동 적용
```

---

**🎯 다음 단계를 계속 진행하시겠습니까?**

1. **Feature 카드 관리 UI 완성**
2. **탭 컨텐츠 관리 UI 완성**
3. **MenuManager 레이아웃 선택 추가**
