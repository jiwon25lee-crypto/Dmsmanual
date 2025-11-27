# 🔧 Accordion 레이아웃 버그 수정 완료

작성일: 2025-11-26  
**근본 문제 해결: Admin에서 레이아웃별 UI 분기 누락**

---

## 🚨 **근본 문제 (사용자 보고)**

```
Admin에서 공지사항 페이지(accordion 레이아웃) 수정 시
   ↓
PageEditor가 layout: "accordion" 감지 ✅
   ↓
BUT
   ↓
보여주는 UI는 Default 페이지 (Step 관리) ❌
   ↓
"페이지 타입을 나눴으면 똑바로 반영이 돼야할 거 아녀!!!"
```

---

## 🔍 **원인 분석**

### 문제 1: TabsContent 조건부 렌더링 누락 ❌

**Before:**
```typescript
// TabsTrigger는 조건부 ✅
{pageLayout === 'default' && (
  <TabsTrigger value="steps">📋 Step 관리</TabsTrigger>
)}

{pageLayout === 'accordion' && (
  <TabsTrigger value="notices">📢 공지사항 관리</TabsTrigger>
)}

// 하지만 TabsContent는 항상 렌더링 ❌
<TabsContent value="steps">
  {/* Step 관리 UI */}
</TabsContent>

<TabsContent value="features">
  {/* Feature 카드 UI */}
</TabsContent>

<TabsContent value="tab-content">
  {/* 탭 컨텐츠 UI */}
</TabsContent>

<TabsContent value="notices">
  {/* 공지사항 UI */}
</TabsContent>
```

**→ accordion 페이지에서도 모든 TabsContent가 렌더링됨!**

---

### 문제 2: activeTab 초기값 ❌

```typescript
const [activeTab, setActiveTab] = useState("basic");
```

- accordion 페이지 열림
- activeTab = "basic" (기본 정보 탭)
- "기본 정보" 탭에 Step 관리 UI가 보임

---

## ✅ **적용된 수정**

### 1. TabsContent 조건부 렌더링 추가 ✅

**After:**
```typescript
{/* Step 관리 탭 - default 레이아웃 전용 */}
{pageLayout === 'default' && (
  <TabsContent value="steps" className="space-y-4">
    {/* Step 관리 UI */}
  </TabsContent>
)}

{/* Feature 카드 관리 탭 - features 레이아웃 전용 */}
{pageLayout === 'features' && (
  <TabsContent value="features" className="space-y-4">
    <FeatureCardsEditor ... />
  </TabsContent>
)}

{/* 탭 컨텐츠 관리 탭 - tabs 레이아웃 전용 */}
{pageLayout === 'tabs' && (
  <TabsContent value="tab-content" className="space-y-4">
    <TabContentEditor ... />
  </TabsContent>
)}

{/* 공지사항 관리 탭 - accordion 레이아웃 전용 */}
{pageLayout === 'accordion' && (
  <TabsContent value="notices" className="space-y-4">
    <AccordionEditor ... />
  </TabsContent>
)}
```

**→ 이제 해당 레이아웃에 맞는 TabsContent만 렌더링됨!**

---

### 2. activeTab 초기값 동적 설정 ✅

**After:**
```typescript
// 🆕 레이아웃에 따라 초기 activeTab 설정
const getInitialTab = () => {
  switch (pageLayout) {
    case 'default':
      return 'basic'; // default는 기본 정보부터 시작
    case 'features':
      return 'basic'; // features도 기본 정보부터 시작
    case 'tabs':
      return 'basic'; // tabs도 기본 정보부터 시작
    case 'accordion':
      return 'basic'; // accordion도 기본 정보부터 시작
    default:
      return 'basic';
  }
};

const [activeTab, setActiveTab] = useState(getInitialTab());
```

**→ 모든 레이아웃에서 "기본 정보" 탭부터 시작하지만, 이제 올바른 UI만 표시됨!**

---

## 🎯 **동작 흐름 (Before vs After)**

### Before (잘못된 동작):
```
accordion 페이지 (notice-1111) 열기
   ↓
PageEditor: pageLayout = "accordion" ✅
   ↓
TabsList:
  - 📝 기본 정보 ✅
  - 📢 공지사항 관리 ✅
   ↓
activeTab = "basic" (기본 정보)
   ↓
TabsContent: value="basic" 표시 ✅
BUT
TabsContent: value="steps" 도 DOM에 존재 ❌
   ↓
Step 관리 UI가 보임 ❌
```

### After (올바른 동작):
```
accordion 페이지 (notice-1111) 열기
   ↓
PageEditor: pageLayout = "accordion" ✅
   ↓
TabsList:
  - 📝 기본 정보 ✅
  - 📢 공지사항 관리 ✅
   ↓
activeTab = "basic" (기본 정보)
   ↓
TabsContent 조건부 렌더링:
  - value="basic" ✅ (렌더링됨)
  - value="steps" ❌ (렌더링 안 됨 - pageLayout !== 'default')
  - value="features" ❌ (렌더링 안 됨 - pageLayout !== 'features')
  - value="tab-content" ❌ (렌더링 안 됨 - pageLayout !== 'tabs')
  - value="notices" ✅ (렌더링됨 - pageLayout === 'accordion')
   ↓
기본 정보 탭: 제목, 소개, 헤더 이미지만 표시 ✅
공지사항 관리 탭: AccordionEditor 표시 ✅
```

---

## 📊 **레이아웃별 탭 구성**

| 레이아웃 | TabsTrigger 1 | TabsTrigger 2 | TabsContent 렌더링 |
|---------|--------------|--------------|-------------------|
| **default** | 📝 기본 정보 | 📋 Step 관리 | basic, steps |
| **features** | 📝 기본 정보 | 🎯 Feature 카드 관리 | basic, features |
| **tabs** | 📝 기본 정보 | 📑 탭 컨텐츠 관리 | basic, tab-content |
| **accordion** | 📝 기본 정보 | 📢 공지사항 관리 | basic, notices |

---

## 🧪 **테스트 시나리오**

### 시나리오 1: notice-1111 (accordion) 편집
1. Admin → 메뉴 관리 → notice-1111 클릭
2. **예상 결과:**
   - ✅ 탭: "📝 기본 정보" / "📢 공지사항 관리"
   - ✅ 기본 정보 탭: 제목, 소개, 헤더 이미지만
   - ✅ 공지사항 관리 탭: AccordionEditor
   - ❌ Step 관리 UI 없음
   - ❌ Feature 카드 UI 없음

### 시나리오 2: login-admin (default) 편집
1. Admin → 메뉴 관리 → login-admin 클릭
2. **예상 결과:**
   - ✅ 탭: "📝 기본 정보" / "📋 Step 관리"
   - ✅ 기본 정보 탭: 제목, 소개, 헤더 이미지만
   - ✅ Step 관리 탭: Step 목록, Step 추가
   - ❌ 공지사항 관리 UI 없음

### 시나리오 3: start-features (features) 편집
1. Admin → 메뉴 관리 → start-features 클릭
2. **예상 결과:**
   - ✅ 탭: "📝 기본 정보" / "🎯 Feature 카드 관리"
   - ✅ 기본 정보 탭: 제목, 소개, 헤더 이미지만
   - ✅ Feature 카드 관리 탭: FeatureCardsEditor
   - ❌ Step 관리 UI 없음
   - ❌ 공지사항 관리 UI 없음

---

## 📝 **수정 파일**

### `/components/admin/PageEditor.tsx` ✅

**변경 내용:**
1. ✅ `getInitialTab()` 함수 추가
2. ✅ `useState(getInitialTab())` 적용
3. ✅ 모든 TabsContent를 `{pageLayout === '...' && ()}` 로 감싸기

**줄 수:** 약 900줄 → 동일 (조건부 렌더링만 추가)

---

## 🎉 **성공 기준**

다음 조건이 모두 충족되면 완전 해결:

1. ✅ accordion 페이지에서 Step 관리 UI가 보이지 않음
2. ✅ accordion 페이지에서 "공지사항 관리" 탭 클릭 시 AccordionEditor 표시
3. ✅ default 페이지에서 "Step 관리" 탭 클릭 시 Step 목록 표시
4. ✅ features 페이지에서 "Feature 카드 관리" 탭 클릭 시 FeatureCardsEditor 표시
5. ✅ 레이아웃 간 UI 혼선 없음

---

## 🚀 **즉시 확인 방법**

### Step 1: 브라우저 강제 새로고침
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Step 2: Admin에서 notice-1111 편집

### Step 3: 확인 사항
```
✅ 탭이 2개만 보임: "기본 정보" / "공지사항 관리"
✅ "기본 정보" 탭: Step UI 없음
✅ "공지사항 관리" 탭: AccordionEditor 표시
```

---

## 📌 **추가 개선 사항**

### NoticeListPage pageId prop 추가 (이전 수정)
- ✅ NoticeListPage가 동적 pageId 지원
- ✅ ManualContent에서 pageId 전달
- ✅ notice-1111, notice-list 등 여러 페이지 지원

### LanguageContext notice-list 메타데이터 (이전 수정)
- ✅ `"notice-list": { layout: "accordion" }` 추가

---

## 💡 **핵심 교훈**

### React Tabs 컴포넌트 동작 방식:
```typescript
// TabsTrigger: 탭 버튼 (클릭 가능)
<TabsTrigger value="steps">📋 Step 관리</TabsTrigger>

// TabsContent: 탭 내용 (항상 DOM에 존재!)
<TabsContent value="steps">
  {/* 이 내용은 activeTab !== "steps"일 때도 DOM에 있음! */}
  {/* 단지 display: none으로 숨겨질 뿐! */}
</TabsContent>
```

**→ 조건부 렌더링(`{condition && <Component />}`)을 사용해야 완전히 제거됨!**

---

**작성자: AI Assistant**  
**작성일: 2025-11-26**  
**상태: ✅ 코드 수정 완료, 테스트 대기 중**

---

## 🔗 **관련 문서**

- `/SYNC_FIX_COMPLETE.md` - NoticeListPage pageId 동기화 수정
- `/QUICK_FIX_CACHE.md` - 브라우저 캐시 문제 해결
- `/DEBUG_SYNC_ISSUE.md` - 디버깅 가이드
