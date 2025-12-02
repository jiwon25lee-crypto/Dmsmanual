
This is a code bundle for DMS Manual. The original project is available at https://www.figma.com/design/BtkdNwyKCfHlbiQeALG2xy/DMS-Manual.

  ## Running the code
  # DMS Manual

DMS(Diet Management System) 서비스 사용 가이드 매뉴얼 시스템입니다.

## Links

| 구분 | URL |
|------|-----|
| **Production** | https://dms-guide.figma.site |
| **Admin** | https://dms-guide.figma.site/#admin |
| **Figma Make** | https://www.figma.com/make/BtkdNwyKCfHlbiQeALG2xy/DMS-Manual |
| **Supabase** | https://supabase.com/dashboard/project/vjarientvsrtyidbctmk |

---

## Tech Stack

| 구분 | 기술 |
|------|------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite 6.3.5 |
| **Styling** | Tailwind CSS |
| **UI Components** | Radix UI (shadcn/ui) |
| **Backend** | Supabase (PostgreSQL + Edge Functions + Storage) |
| **Deployment** | Figma Sites |

---

## Directory Structure

```
Dmsmanual/
├── src/
│   ├── App.tsx                      # 메인 앱 (라우팅 분기)
│   ├── main.tsx                     # 진입점
│   ├── index.css                    # 전역 스타일 (Tailwind)
│   │
│   ├── components/
│   │   ├── LanguageContext.tsx      # [핵심] 다국어 + 데이터 관리 (156KB)
│   │   ├── ManualSidebar.tsx        # 사이드바 네비게이션
│   │   ├── ManualContent.tsx        # 메인 콘텐츠 영역
│   │   │
│   │   ├── admin/                   # 백오피스 (관리자)
│   │   │   ├── AdminDashboard.tsx   # 관리자 대시보드
│   │   │   ├── MenuManager.tsx      # 대메뉴/소메뉴 관리
│   │   │   ├── PageManager.tsx      # 페이지 목록 관리
│   │   │   ├── PageEditor.tsx       # 페이지 콘텐츠 편집기 (42KB)
│   │   │   ├── ImageUploader.tsx    # 이미지 업로드
│   │   │   └── ...
│   │   │
│   │   ├── pages/                   # 페이지 템플릿
│   │   │   ├── DefaultPage.tsx      # 기본 (Step 형식)
│   │   │   ├── StartFeaturesPage.tsx # 시작 (카드 그리드)
│   │   │   └── NoticeListPage.tsx   # 공지사항 (아코디언)
│   │   │
│   │   ├── ui/                      # Radix UI 컴포넌트
│   │   ├── common/                  # 공통 컴포넌트
│   │   └── figma/                   # Figma 연동 컴포넌트
│   │
│   ├── config/
│   │   └── pages.ts                 # 페이지 설정 (정적)
│   │
│   ├── supabase/
│   │   ├── migrations/              # DB 마이그레이션 (참고용)
│   │   └── functions/               # Edge Functions (참고용)
│   │
│   ├── utils/                       # 유틸리티 함수
│   ├── hooks/                       # Custom Hooks
│   └── styles/                      # 추가 스타일
│
├── package.json
├── vite.config.ts
└── index.html
```

---

## Core Architecture

### Routing (Hash-based)

```
URL: https://dms-guide.figma.site/

#start-features  -> Manual: DMS 시작하기
#login-admin     -> Manual: 기관 관리자 회원가입
#admin           -> Backoffice: 관리자 대시보드
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Data Flow                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Admin Backoffice]                                          │
│       │                                                      │
│       v  saveChanges()                                       │
│  ┌─────────────────────────────────────────────┐            │
│  │  Supabase Edge Function                      │            │
│  │  /functions/v1/make-server-8aea8ee5          │            │
│  │    ├── /manual/save (POST)                   │            │
│  │    └── /manual/load (GET)                    │            │
│  └─────────────────────────────────────────────┘            │
│       │                                                      │
│       v                                                      │
│  ┌─────────────────────────────────────────────┐            │
│  │  Supabase Database                           │            │
│  │  └── kv_store_8aea8ee5 (Key-Value Store)    │            │
│  │       key: "manual-data"                     │            │
│  │       value: { translations, visibility }   │            │
│  └─────────────────────────────────────────────┘            │
│       │                                                      │
│       v                                                      │
│  [Front Manual Page] <- LanguageContext Load                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Core Component: LanguageContext.tsx

```typescript
// Role: Global State Management + Supabase Integration

const LanguageContext = {
  // i18n
  language: "ko" | "en",
  t: (key: string) => string,           // Translation function
  
  // Data Management
  updateTranslation: () => void,         // Update single translation
  updatePageData: () => void,            // Update entire page
  saveChanges: () => Promise<boolean>,   // Save to Supabase
  
  // Menu Management
  addCategory: () => void,               // Add main menu
  addPage: () => void,                   // Add sub menu
  deleteCategory: () => void,            // Delete main menu
  deletePage: () => void,                // Delete sub menu
  reorderCategories: () => void,         // Reorder
  reorderPages: () => void,
};
```

---

## Supabase Status

### Database

| Table | Purpose | Note |
|-------|---------|------|
| `kv_store_8aea8ee5` | All manual data (JSON) | Auto-generated by Figma Make |

### Storage Buckets

| Bucket | Purpose | Config |
|--------|---------|--------|
| `make-8aea8ee5-page-images` | Page images | Public |
| `make-8aea8ee5-manual-images` | Manual images | Public, 5MB limit |

### Edge Functions

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `make-server-8aea8ee5` | `/manual/load` | Load data |
| | `/manual/save` | Save data |

### Data Structure (kv_store_8aea8ee5)

```json
{
  "translations": {
    "ko": {
      "category.start": "DMS 시작하기",
      "login-admin.title": "기관 대표 관리자 회원가입",
      "login-admin.step1.title": "무료 체험 신청 페이지 접속"
    },
    "en": { ... }
  },
  "commonVisibility": {
    "login-admin.step1.visible": true,
    "login-admin.step1.image-visible": true
  },
  "pageMetadata": {
    "login-admin": { "layout": "default" },
    "start-features": { "layout": "features" },
    "notice-list": { "layout": "accordion" }
  }
}
```

---

## Page Layouts

| Layout | Component | Usage |
|--------|-----------|-------|
| `default` | DefaultPage.tsx | Step-by-step guide |
| `features` | StartFeaturesPage.tsx | Card grid (main) |
| `accordion` | NoticeListPage.tsx | Accordion (notices) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build
npm run build
```

### Local Access

```
Manual: http://localhost:5173/
Backoffice: http://localhost:5173/#admin
```

---

## Admin Usage

### Access Backoffice

1. Go to url update...
2. Select page to edit from left menu
3. Edit content and click **Save** button

### Menu Management

- **Add main menu**: Menu Manager -> Add Category
- **Add sub menu**: Menu Manager -> Add Page (select layout)
- **Reorder**: Drag and Drop

### Image Upload

- Formats: JPG, PNG, GIF, WebP
- Max size: 5MB
- Storage: Supabase Storage

---
---

  Run `npm i` to install the dependencies.
## Last Updated

  Run `npm run dev` to start the development server.
  
2025-11-28
