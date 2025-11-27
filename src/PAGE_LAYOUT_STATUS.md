# 📋 페이지 레이아웃별 편집 기능 현황

## 🔍 **현재 상황 분석**

### ✅ **완전히 지원되는 레이아웃**

#### **1. DefaultPage (기본 레이아웃 - 넘버링 시스템)**

```
현재 지원되는 편집 기능:
✅ 페이지 제목 (한국어/영어)
✅ 페이지 소개 (한국어/영어)
✅ 최상단 헤더 이미지 (ON/OFF + 업로드/URL)
✅ Step 1~10 관리
   ├─ Step 제목/설명 (한국어/영어)
   ├─ Step 이미지 (업로드/URL)
   ├─ 매뉴얼에 표시 (체크박스)
   └─ 이미지 표시 (체크박스)

사용 페이지:
- 대부분의 소메뉴 페이지 (login-admin, member-register 등)
```

---

### ❌ **지원되지 않는 레이아웃**

#### **2. StartFeaturesPage (카드 그리드 레이아웃)**

```
현재 지원되는 편집 기능:
✅ 페이지 제목 (한국어/영어)
✅ 페이지 소개 (한국어/영어)
✅ 최상단 헤더 이미지 (ON/OFF + 업로드/URL)

❌ 지원되지 않는 기능:
❌ Feature 카드 관리 (feature1, feature2, ...)
   ├─ 카드 제목/설명
   ├─ 카드 아이콘
   ├─ 카드 표시/숨김
   └─ 카드 추가/삭제

사용 페이지:
- start-features (DMS 주요 기능)
- start-intro (DMS 소개)
```

**필요한 데이터 구조:**
```typescript
{
  "start-features.feature1.title": "기능 1 제목",
  "start-features.feature1.desc": "기능 1 설명",
  "start-features.feature1.icon": "🎯",
  "start-features.feature1.visible": true,
}
```

---

#### **3. TabPage (탭 레이아웃)**

```
현재 지원되는 편집 기능:
✅ 페이지 제목 (한국어/영어)
✅ 페이지 소개 (한국어/영어)
✅ 최상단 헤더 이미지 (ON/OFF + 업로드/URL)

❌ 지원되지 않는 기능:
❌ 탭 관리
   ├─ Overview 탭 컨텐츠
   ├─ Features 탭 컨텐츠
   └─ Guide 탭 컨텐츠

사용 페이지:
- member-dashboard (회원 대시보드)
```

**필요한 데이터 구조:**
```typescript
{
  "member-dashboard.overview.title": "개요 제목",
  "member-dashboard.overview.desc": "개요 설명",
  "member-dashboard.features.feature1.title": "기능 1",
  "member-dashboard.guide.step1.title": "가이드 1",
}
```

---

#### **4. NoticeListPage (아코디언 레이아웃)**

```
현재 지원되는 편집 기능:
✅ 페이지 제목 (한국어/영어)
✅ 페이지 소개 (한국어/영어)

❌ 지원되지 않는 기능:
❌ 공지사항 아코디언 관리
   ├─ 공지사항 제목
   ├─ 공지사항 내용
   ├─ 공지사항 추가/삭제
   └─ 공지사항 순서 변경

사용 페이지:
- notice-list (공지사항)
```

**필요한 데이터 구조:**
```typescript
{
  "notice-list.notice1.title": "공지사항 1 제목",
  "notice-list.notice1.content": "공지사항 1 내용",
  "notice-list.notice2.title": "공지사항 2 제목",
  "notice-list.notice2.content": "공지사항 2 내용",
}
```

---

## 📊 **지원 현황 요약**

| 레이아웃 | 파일 | 사용 페이지 | 편집 지원 | 비고 |
|---------|------|------------|----------|------|
| DefaultPage | `DefaultPage.tsx` | 대부분 | ✅ 완전 지원 | Step 1~10 관리 |
| StartFeaturesPage | `StartFeaturesPage.tsx` | 2개 | ⚠️ 부분 지원 | Feature 카드 관리 없음 |
| TabPage | `TabPage.tsx` | 1개 | ⚠️ 부분 지원 | 탭 컨텐츠 관리 없음 |
| NoticeListPage | `NoticeListPage.tsx` | 1개 | ⚠️ 부분 지원 | 아코디언 관리 없음 |

---

## 🎯 **현재 PageEditor의 제약**

### **현재 구조:**

```typescript
// PageEditor는 DefaultPage 레이아웃만 가정하고 설계됨

const pageData = {
  title: { ko: string, en: string },
  intro: { ko: string, en: string },
  guideTitle: { ko: string, en: string },
  headerImage: string,
  headerImageEnabled: boolean,
  headerImageInputMethod: "upload" | "url",
  steps: StepData[],  // ← DefaultPage 전용
};
```

### **문제점:**

```
1. Step 관리 탭이 모든 페이지에 표시됨
   → StartFeaturesPage에는 Step이 없는데도 표시됨
   → TabPage에는 Step이 없는데도 표시됨

2. Feature 카드 관리 기능 없음
   → StartFeaturesPage 편집 불가

3. 탭 컨텐츠 관리 기능 없음
   → TabPage 편집 불가

4. 아코디언 관리 기능 없음
   → NoticeListPage 편집 불가
```

---

## 💡 **해결 방안**

### **옵션 1: 레이아웃별 동적 탭 구성 (권장)**

```typescript
// PageEditor에서 페이지 레이아웃 타입 감지
const pageLayout = detectPageLayout(pageId);

// 레이아웃에 따라 탭 구성 변경
{pageLayout === "default" && (
  <TabsTrigger value="steps">📋 Step 관리</TabsTrigger>
)}
{pageLayout === "features" && (
  <TabsTrigger value="features">🎯 Feature 카드 관리</TabsTrigger>
)}
{pageLayout === "tabs" && (
  <TabsTrigger value="tabs">📑 탭 컨텐츠 관리</TabsTrigger>
)}
{pageLayout === "accordion" && (
  <TabsTrigger value="notices">📢 공지사항 관리</TabsTrigger>
)}
```

**장점:**
- 각 레이아웃에 최적화된 UI 제공
- 불필요한 탭 숨김
- 확장성 좋음

**단점:**
- 구현 복잡도 증가
- 레이아웃 감지 로직 필요

---

### **옵션 2: 메타데이터로 레이아웃 타입 명시**

```typescript
// LanguageContext.tsx에 메타데이터 추가
const pageMetadata = {
  "start-features": {
    layout: "features",
    tabs: ["basic", "features"],
  },
  "member-dashboard": {
    layout: "tabs",
    tabs: ["basic", "tab-content"],
  },
  "login-admin": {
    layout: "default",
    tabs: ["basic", "steps"],
  },
};
```

**장점:**
- 명시적이고 명확함
- 확장 가능
- 관리 용이

**단점:**
- 메타데이터 유지보수 필요

---

### **옵션 3: 범용 편집기 (현재 방식 유지)**

```
모든 페이지에 동일한 편집 UI 제공
- 기본 정보 탭: 모든 페이지 공통
- Step 관리 탭: DefaultPage만 사용, 나머지는 비워둠

장점: 단순함
단점: 사용자 혼란, 비효율적
```

---

## 🚀 **추천 구현 순서**

### **Phase 1: 레이아웃 감지 시스템**

```typescript
// 1. 페이지 레이아웃 타입 정의
type PageLayout = "default" | "features" | "tabs" | "accordion";

// 2. 레이아웃 감지 함수
function detectPageLayout(pageId: string): PageLayout {
  if (pageId === "start-features" || pageId === "start-intro") {
    return "features";
  }
  if (pageId === "member-dashboard") {
    return "tabs";
  }
  if (pageId === "notice-list") {
    return "accordion";
  }
  return "default";
}

// 3. PageEditor에서 사용
const pageLayout = detectPageLayout(pageId);
```

---

### **Phase 2: Feature 카드 관리 UI 추가**

```typescript
// StartFeaturesPage 전용 탭
<TabsContent value="features" className="space-y-4">
  <div className="flex justify-between items-center">
    <h3>Feature 카드 목록</h3>
    <Button onClick={addFeatureCard}>
      <Plus className="w-4 h-4 mr-2" />
      Feature 추가
    </Button>
  </div>

  {pageData.features.map((feature, index) => (
    <Card key={index}>
      <CardHeader>
        <CardTitle>Feature {index + 1}</CardTitle>
        <div className="flex items-center gap-4">
          <label>
            <input type="checkbox" checked={feature.visible} />
            매뉴얼에 표시
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {/* 제목, 설명, 아이콘 입력 */}
      </CardContent>
    </Card>
  ))}
</TabsContent>
```

---

### **Phase 3: 탭 컨텐츠 관리 UI 추가**

```typescript
// TabPage 전용 탭
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
    {/* ... */}
  </Tabs>
</TabsContent>
```

---

### **Phase 4: 아코디언 관리 UI 추가**

```typescript
// NoticeListPage 전용 탭
<TabsContent value="notices" className="space-y-4">
  <div className="flex justify-between items-center">
    <h3>공지사항 목록</h3>
    <Button onClick={addNotice}>
      <Plus className="w-4 h-4 mr-2" />
      공지사항 추가
    </Button>
  </div>

  {pageData.notices.map((notice, index) => (
    <Card key={index}>
      <CardHeader>
        <CardTitle>공지사항 {index + 1}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 제목, 내용 입력 */}
      </CardContent>
    </Card>
  ))}
</TabsContent>
```

---

## 📈 **최종 목표**

### **레이아웃별 최적화된 편집 UI:**

```
DefaultPage (기본 레이아웃):
  ├─ 📝 기본 정보
  └─ 📋 Step 관리

StartFeaturesPage (카드 그리드):
  ├─ 📝 기본 정보
  └─ 🎯 Feature 카드 관리

TabPage (탭 레이아웃):
  ├─ 📝 기본 정보
  └─ 📑 탭 컨텐츠 관리

NoticeListPage (아코디언):
  ├─ 📝 기본 정보
  └─ 📢 공지사항 관리
```

---

## 🎯 **결론**

### **현재 상황:**
```
✅ DefaultPage: 완전히 지원됨
⚠️ StartFeaturesPage: 기본 정보만 지원 (Feature 카드 관리 없음)
⚠️ TabPage: 기본 정보만 지원 (탭 컨텐츠 관리 없음)
⚠️ NoticeListPage: 기본 정보만 지원 (아코디언 관리 없음)
```

### **해결 방안:**
```
1. 레이아웃 감지 시스템 구축
2. 레이아웃별 동적 탭 구성
3. 각 레이아웃 전용 편집 UI 추가
   ├─ Feature 카드 관리 UI
   ├─ 탭 컨텐츠 관리 UI
   └─ 아코디언 관리 UI
```

### **우선순위:**
```
1순위: StartFeaturesPage (사용 빈도 높음)
2순위: TabPage (복잡도 중간)
3순위: NoticeListPage (사용 빈도 낮음)
```

---

**🎯 다음 단계를 진행하시겠습니까?**

1. **레이아웃 감지 시스템 구축**
2. **StartFeaturesPage Feature 카드 관리 UI 추가**
3. **TabPage 탭 컨텐츠 관리 UI 추가**
4. **NoticeListPage 아코디언 관리 UI 추가**

어떤 것부터 시작하시겠습니까?
