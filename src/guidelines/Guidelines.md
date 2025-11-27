# DMS 매뉴얼 가이드라인 (2025. 11)

## 📁 프로젝트 구조

### 아키텍처

```
/
├── App.tsx                           # 메인 애플리케이션 엔트리
├── components/
│   ├── common/
│   │   └── PageComponents.tsx        # 공통 컴포넌트 (Tooltip, Step, ImageContainer, TipBox, FeatureGrid)
│   ├── pages/                        # 페이지 컴포넌트
│   │   ├── DefaultPage.tsx           # 기본 페이지 (넘버링 시스템)
│   │   ├── StartFeaturesPage.tsx     # 컨텐츠 카드 UI
│   │   └── NoticeListPage.tsx        # 공지사항 아코디언
│   ├── LanguageContext.tsx           # 모든 번역 텍스트 중앙 관리 + visible 제어
│   ├── ManualContent.tsx             # 페이지 라우터
│   ├── ManualSidebar.tsx             # 사이드바 네비게이션
│   ├── figma/
│   │   └── ImageWithFallback.tsx    # 이미지 컴포넌트 (보호됨)
│   └── ui/                          # Shadcn UI 컴포넌트들 (46개)
├── imports/                         # Figma import 컴포넌트
│   ├── Card.tsx
│   ├── Container.tsx
│   ├── FeatureImage.tsx
│   └── svg-*.tsx / svg-*.ts         # SVG 리소스
├── guidelines/
│   └── Guidelines.md                # 이 파일
└── styles/
    └── globals.css                  # 공통 스타일 및 디자인 토큰
```

---

## 설계 원칙

### 1. 완전한 페이지 독립성

- **각 페이지는 별도의 파일**로 관리 (`/components/pages/`)
- 한 페이지 수정 시 다른 페이지에 영향 없음
- 새 페이지 추가 시 단순히 파일 생성 후 라우터에 연결

### 2. 텍스트 콘텐츠 중앙화

- **모든 텍스트는 `/components/LanguageContext.tsx`에서 관리**
- 한국어/영어 번역을 한 곳에서 통제
- 페이지 컴포넌트는 `t()` 함수만 사용

### 3. 컴포넌트 재사용성

- 공통 UI 요소는 `/components/common/PageComponents.tsx`에 집중
- `Tooltip`, `Step`, `ImageContainer`, `TipBox`, `FeatureGrid` - 모든 페이지에서 재사용

### 4. Shadcn UI 활용

- `/components/ui/`에 46개의 Shadcn 컴포넌트 보유
- 복사-붙여넣기 방식으로 프로젝트에 통합됨
- **수정 금지**: `/components/ui/` 내부 파일은 직접 수정하지 않음

---

## 컴포넌트 아키텍처

### 1️. 공통 컴포넌트 (`/components/common/PageComponents.tsx`)

페이지별 커스텀 컴포넌트로, 프로젝트 특화 UI 패턴 제공

### 2️. Shadcn UI 컴포넌트 (`/components/ui/`)

범용 UI 컴포넌트로, 다양한 프로젝트에서 재사용 가능

| 구분                | 위치                  | 용도               | 수정 가능 여부 |
| ------------------- | --------------------- | ------------------ | -------------- |
| **공통 컴포넌트**   | `/components/common/` | 프로젝트 전용 UI   | ✅ 수정 가능   |
| **Shadcn UI**       | `/components/ui/`     | 범용 UI 라이브러리 | ❌ 수정 금지   |
| **페이지 컴포넌트** | `/components/pages/`  | 페이지별 레이아웃  | ✅ 수정 가능   |

---

### 현재 프로젝트 사용 컴포넌트

#### **필수 컴포넌트** (현재 활발히 사용 중)

- `button.tsx` - 버튼
- `card.tsx` - 카드 컨테이너
- `tabs.tsx` - 탭 UI
- `dropdown-menu.tsx` - 드롭다운 메뉴

#### **사용 예시**

```typescript
// Button
import { Button } from "./ui/button";
<Button variant="ghost" size="icon">아이콘</Button>

// Card
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>내용</CardContent>
</Card>

// Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
<Tabs value={activeTab}>
  <TabsList>
    <TabsTrigger value="tab1">탭 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">내용</TabsContent>
</Tabs>

// DropdownMenu
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>메뉴</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>항목 1</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### **사용 가능한 전체 컴포넌트 (46개)**

<details>
<summary>펼쳐보기</summary>

**레이아웃**: card, tabs, separator, sidebar, sheet  
**폼**: button, input, textarea, checkbox, radio-group, select, switch, slider, form, label, input-otp  
**네비게이션**: dropdown-menu, navigation-menu, menubar, context-menu, breadcrumb, pagination  
**오버레이**: dialog, alert-dialog, popover, tooltip, hover-card, drawer  
**피드백**: alert, badge, progress, skeleton, sonner  
**데이터**: table, chart, avatar, aspect-ratio, calendar  
**기타**: accordion, collapsible, carousel, command, toggle, toggle-group, scroll-area, resizable

</details>

---

## 텍스트 콘텐츠 수정 방법

### `/components/LanguageContext.tsx` 파일만 수정

```typescript
ko: {
  // 페이지별로 네임스페이스로 구분
  "start-intro.title": "DMS 소개",
  "start-intro.intro": "DMS는...",
  "start-intro.feature1.title": "기능 1",
  "start-intro.feature1.desc": "기능 1 설명",

  "default.title": "매뉴얼",
  "default.step1.title": "첫 번째 단계",

  // 각 페이지별로 독립적인 키 구조
}

en: {
  "start-intro.title": "DMS Introduction",
  "start-intro.intro": "DMS is...",
  // 동일한 키 구조로 영어 번역
}
```

**키 네이밍 규칙:**

- `{page}.title` - 페이지 제목
- `{page}.intro` - 페이지 소개 텍스트
- `{page}.header-image` - 페이지 최상단 이미지 URL (옵션)
- `{page}.tooltip1`, `{page}.tooltip2` - 툴팁 메시지
- `{page}.guide-title` - 가이드 섹션 제목
- `{page}.step{N}.title` - N번째 단계 제목
- `{page}.step{N}.desc` - N번째 단계 설명
- `{page}.step{N}.image` - N번째 단계 이미지 URL 🆕
- `{page}.step{N}.visible` - N번째 단계 표시 여부 (boolean)
- `{page}.step{N}.image-visible` - N번째 단계 이미지 표시 여부 (boolean)
- `{page}.feature{N}.title` - N번째 기능 제목
- `{page}.feature{N}.desc` - N번째 기능 설명
- `{page}.feature{N}.visible` - N번째 기능 카드 표시 여부 (boolean)
- `{page}.tip-title` - 팁 제목
- `{page}.tip-desc` - 팁 설명

---

## Visibility 제어 시스템 (commonVisibility)

### LanguageContext.tsx의 공통 Visibility 객체

모든 페이지의 Step과 Feature 카드의 표시/숨김을 **boolean 값**으로 제어합니다.
이 설정은 **모든 언어에 공통으로 적용**되어 한 번만 설정하면 됩니다.

```typescript
const commonVisibility: Record<string, boolean> = {
  // DefaultPage Step 제어
  "login-admin.step1.visible": true, // Step 1 표시
  "login-admin.step1.image-visible": true, // Step 1 이미지 표시
  "login-admin.step2.visible": false, // Step 2 숨김
  "login-admin.step2.image-visible": false, // Step 2 이미지 숨김

  // StartFeaturesPage 카드 제어
  "start-features.feature1.visible": true, // 카드 1 표시
  "start-features.feature2.visible": false, // 카드 2 숨김
};
```

### 사용 방법

```typescript
// DefaultPage에서 Step visible 체크
{t(`${pageId}.step1.visible`) && (
  <div className=\"mb-12\">
    {/* Step 1 콘텐츠 */}
  </div>
)}

// Step 내부 이미지 visible 체크
{t(`${pageId}.step1.image-visible`) && (
  <ImageContainer
    src={t(`${pageId}.step1.image`) as string}
    alt={t(`${pageId}.step1.title`) as string}
  />
)}
```

---

## 🆕 새 페이지 추가 방법

### Step 1: 페이지 컴포넌트 생성

```typescript
// /components/pages/NewPage.tsx
import { useLanguage } from "../LanguageContext";
import { ImageContainer, Tooltip, Step, TipBox } from "../common/PageComponents";

export function NewPage() {
  const { t } = useLanguage();

  return (
    <>
      <h1 className="text-foreground mb-6">
        {t("newpage.title")}
      </h1>

      <p className="text-foreground mb-6 leading-relaxed">
        {t("newpage.intro")}
      </p>

      <Tooltip>{t("newpage.tooltip1")}</Tooltip>

      <ImageContainer
        src="https://images.unsplash.com/photo-..."
        alt="New Page"
      />

      <h2 className="text-foreground mb-6">
        {t("newpage.guide-title")}
      </h2>

      <Step
        number={1}
        title={t("newpage.step1.title")}
        description={t("newpage.step1.desc")}
      />

      <TipBox
        title={t("newpage.tip-title")}
        description={t("newpage.tip-desc")}
      />
    </>
  );
}
```

### Step 2: 번역 텍스트 추가 (`LanguageContext.tsx`)

```typescript
ko: {
  // ... 기존 번역들
  "newpage.title": "새 페이지 제목",
  "newpage.intro": "새 페이지 소개",
  "newpage.tooltip1": "툴팁 내용",
  "newpage.guide-title": "가이드 제목",
  "newpage.step1.title": "첫 번째 단계",
  "newpage.step1.desc": "첫 번째 단계 설명",
  "newpage.tip-title": "팁 제목",
  "newpage.tip-desc": "팁 설명",
},
en: {
  // ... 영어 번역
  "newpage.title": "New Page Title",
  "newpage.intro": "New page introduction",
  // ...
}
```

### Step 3: 라우터에 연결 (`ManualContent.tsx`)

```typescript
// Import 추가
import { NewPage } from "./pages/NewPage";

// renderContent() 함수의 switch 문에 추가
const renderContent = () => {
  switch (activeSection) {
    // ... 기존 케이스들
    case "new-page-id":
      return <NewPage />;
    default:
      return <DefaultPage />;
  }
};
```

### Step 4: 사이드바 메뉴 추가 (`ManualSidebar.tsx`)

```typescript
{
  id: "new-section",
  title: t("category.newsection"),
  sections: [
    { id: "new-page-id", title: t("section.newsection.newpage") },
  ],
}
```

---

## 디자인 시스템 규칙

### 브랜드 컬러 시스템 🆕

**브랜드 컬러**: `#2C5600` (다크 그린)

- h1, h2 제목에 적용
- 넘버링 아이콘 배경색
- 버튼 및 강조 요소
- Tailwind 클래스: `bg-brand`, `text-brand`, `border-brand`

**포인트 컬러** (4개):

- `red` - 위험/경고
- `yellow` - 주의/알림
- `green` - 성공/확인
- `stroke` - 테두리

### 색상 및 테마

- Tailwind 클래스만 사용: `text-foreground`, `bg-background`, `border-border` 등
- `globals.css`의 CSS 변수 활용
- 브랜드 컬러: `bg-brand`, `text-brand`, `border-brand`

### 타이포그래피

- **폰트 크기/굵기/행간 클래스 사용 금지** (예: `text-2xl`, `font-bold`, `leading-none`)
- `globals.css`의 기본 타이포그래피 시스템 활용

### 레이아웃

- 데스크톱 최적화 (1920px 기준)
- 반응형 대응: 모바일,데스크톱
- Flexbox와 Grid 우선 사용
- 절대 위치는 최소화

### 간격 시스템

- `gap-3`, `gap-4`, `gap-6` - 일관된 간격 사용
- `mb-6`, `mb-8` - 섹션 간 여백
- `p-4`, `p-6` - 패딩

---

## 이미지 처리

### 일반 이미지 (ImageContainer 사용 권장)

```typescript
<ImageContainer
  src="https://images.unsplash.com/photo-..."
  alt="Description"
  maxWidth="800px"
  maxHeight="600px"
/>
```

### 직접 ImageWithFallback 사용

```typescript
<ImageWithFallback
  src="https://images.unsplash.com/photo-..."
  alt="Description"
  className="w-full max-w-[800px] h-auto rounded-lg border border-border"
  style={{
    aspectRatio: "2/1",
    objectFit: "cover",
  }}
/>
```

### 언어별 이미지 전환

```typescript
import dmsImage from "figma:asset/...png";
import dmsImageEn from "figma:asset/...png";

const { language } = useLanguage();

<ImageContainer
  src={language === "ko" ? dmsImage : dmsImageEn}
  alt="DMS Overview"
/>
```

---

## 다국어 지원

### 현재 지원 언어

- 한국어 (ko)
- 영어 (en)

### 언어 전환 방법

- 모바일: 상단 헤더 우측 드롭다운
- 데스크톱: 우측 상단 고정 드롭다운

### 번역 키 사용

```typescript
const { t, language } = useLanguage();

// 텍스트 번역
<h1>{t("welcome.title")}</h1>
<p>{t("welcome.intro")}</p>

// 언어별 조건부 렌더링
{language === "ko" ? <KoreanComponent /> : <EnglishComponent />}
```

---

### 수정 금지 파일

- `/components/figma/ImageWithFallback.tsx` - 시스템 파일
- `/components/ui/` - Shadcn UI 컴포넌트

### 피해야 할 패턴

- 하드코딩된 텍스트 (모든 텍스트는 LanguageContext 사용)
- 인라인 스타일 (Tailwind 클래스 사용 권장)
- 타이포그래피 클래스 직접 지정 (`font-bold`, `text-2xl` 등)
- 페이지 로직을 ManualContent.tsx에 직접 작성
- 다크모드 등 별도 모드 현재 지원 계획 없음 아직은...

### 권장 사항

- 페이지별 독립 파일 생성
- 공통 컴포넌트 재사용 (ImageContainer, TipBox, FeatureGrid)
- LanguageContext를 통한 텍스트 관리
- 디자인 토큰 활용
- 반복 패턴은 컴포넌트화

---

## 유지보수 가이드

### 페이지 텍스트 수정

1. `/components/LanguageContext.tsx` 파일 열기
2. 해당 페이지 네임스페이스 찾기 (예: `start-intro.*`, `default.*`)
3. 한국어(`ko`)와 영어(`en`) 모두 수정
4. 저장 → 자동 반영

### 페이지 레이아웃 수정

1. `/components/pages/{PageName}.tsx` 파일 열기
2. JSX 구조 수정
3. 다른 페이지에는 영향 없음

### 공통 컴포넌트 수정

1. `/components/common/PageComponents.tsx` 파일 수정
2. **주의:** 모든 페이지에 영향

### 스타일 시스템 수정

1. `/styles/globals.css` 파일 수정
2. CSS 변수 또는 전역 스타일 조정

---

## 현재 페이지 매핑

| 페이지 ID        | 컴포넌트 파일           | 번역 네임스페이스  | 레이아웃 타입     |
| ---------------- | ----------------------- | ------------------ | ----------------- |
| `start-features` | `StartFeaturesPage.tsx` | `start-features.*` | 카드 그리드 (2열) |
| `notice-list`    | `NoticeListPage.tsx`    | `notice-list.*`    | 아코디언          |
| (기본값)         | `DefaultPage.tsx`       | `default.*`        | 기본 레이아웃     |

---

## 페이지 레이아웃 패턴

### 1. 기본 레이아웃 (DefaultPage) - 넘버링 시스템 🆕

DefaultPage는 Step 컴포넌트를 사용하지 않고 **직접 넘버링 시스템**을 구현합니다.

```typescript
export function DefaultPage({ pageId = "default" }: DefaultPageProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* 제목 */}
      <h2 className="mb-6">{t(`${pageId}.title`)}</h2>

      {/* 최상단 이미지 (옵션) */}
      {t(`${pageId}.header-image`) && (
        <ImageContainer
          src={t(`${pageId}.header-image`) as string}
          alt={t(`${pageId}.title`) as string}
        />
      )}

      {/* 소개 */}
      <p className="text-foreground mb-6 leading-relaxed">
        {t(`${pageId}.intro`)}
      </p>

      {/* 가이드 제목 */}
      <h3 className="mb-6">{t(`${pageId}.guide-title`)}</h3>

      {/* Step 1~10: visible로 제어 */}
      {t(`${pageId}.step1.visible`) && (
        <div className="mb-12">
          {/* 넘버 아이콘 + 제목 */}
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              1
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step1.title`)}
            </h3>
          </div>

          {/* 이미지 (image-visible로 제어) */}
          {t(`${pageId}.step1.image-visible`) && (
            <ImageContainer
              src={t(`${pageId}.step1.image`) as string}
              alt={t(`${pageId}.step1.title`) as string}
            />
          )}

          {/* 설명 */}
          <p className="text-muted-foreground">
            {t(`${pageId}.step1.desc`)}
          </p>
        </div>
      )}

      {/* Step 2~10도 동일한 패턴 반복 */}
    </>
  );
}
```

**특징:**

- 브랜드 컬러(`bg-brand`) 넘버링 아이콘
- Step별 표시/숨김 제어 (`step{N}.visible`)
- 이미지별 표시/숨김 제어 (`step{N}.image-visible`)
- 최대 10개 Step 지원
- 최상단 이미지 지원 (`header-image`)

### 2. 카드 그리드 레이아웃 (StartFeaturesPage)

```typescript
export function StartFeaturesPage({ onSectionChange }: Props) {
  const { t } = useLanguage();

  return (
    <>
      {/* 제목 */}
      <h1 className="mb-6">{t("start-features.title")}</h1>

      {/* 최상단 이미지 (옵션) */}
      {t("start-features.header-image") && (
        <ImageContainer
          src={t("start-features.header-image") as string}
          alt={t("start-features.title") as string}
        />
      )}

      {/* 소개 */}
      <p className="text-foreground mb-8 leading-relaxed">
        {t("start-features.intro")}
      </p>

      {/* 대메뉴 바로가기 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {menuCategories.map((menu) => (
          <Card
            key={menu.id}
            className="cursor-pointer hover:effect-shadow-md transition-all duration-300 hover:border-brand"
            onClick={() => onSectionChange(menu.firstSectionId)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{menu.icon}</span>
                    <h3 className="text-foreground">
                      {t(menu.titleKey)}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(menu.descKey)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 하단 안내 텍스트 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-foreground leading-relaxed">
          💡 <span className="font-semibold">{t("start-features.tip-title")}</span>
        </p>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {t("start-features.tip-desc")}
        </p>
      </div>
    </>
  );
}
```

**특징:**

- ✅ 2열 반응형 그리드
- ✅ 클릭 가능한 네비게이션 카드
- ✅ hover 효과 (border-brand)
- ✅ 아이콘 + 제목 + 설명 구조
- ✅ 최상단 이미지 지원 (`header-image`)

### 3. 아코디언 레이아웃 (NoticeListPage) 🆕

```typescript
export function NoticeListPage() {
  const { t } = useLanguage();

  return (
    <>
      <h2 className="mb-6">{t("notice-list.title")}</h2>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="notice-1">
          <AccordionTrigger>
            {t("notice-list.notice1.title")}
          </AccordionTrigger>
          <AccordionContent>
            {t("notice-list.notice1.content")}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
```

**특징:**

- ✅ Shadcn Accordion 컴포넌트 사용
- ✅ 단일 선택 모드 (`type="single"`)
- ✅ 접기/펼치기 가능 (`collapsible`)
- ✅ 공지사항 리스트에 최적화

---

## 체크리스트

### 새 페이지 추가 시:

- [ ] 페이지 컴포넌트 생성 (`/components/pages/`)
- [ ] 공통 컴포넌트 import (ImageContainer, TipBox, FeatureGrid 등)
- [ ] 번역 텍스트 추가 (`LanguageContext.tsx` - 한/영 모두)
- [ ] 라우터 연결 (`ManualContent.tsx`)
- [ ] 사이드바 메뉴 추가 (`ManualSidebar.tsx` + 번역)
- [ ] 반응형 테스트 (모바일/데스크톱)
- [ ] 언어 전환 테스트

---

### Usage

```typescript
// 공통 컴포넌트 사용
<ImageContainer src="..." alt="..." />
<TipBox title={t("tip")} description={t("desc")} />

// 번역 키 사용
<h1>{t("page.title")}</h1>

// 디자인 토큰
className="text-foreground bg-background"
```

---