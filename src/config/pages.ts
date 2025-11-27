/**
 * 페이지 설정 통합 관리
 * 
 * 이 파일에서 모든 페이지의 설정을 중앙 관리합니다.
 * 새 페이지 추가 시 이 파일만 수정하면 자동으로:
 * - 사이드바 메뉴 생성
 * - 라우팅 연결
 * - 카테고리 그룹핑
 */

export type PageComponent = 
  | "DefaultPage" 
  | "StartFeaturesPage" 
  | "TabPage" 
  | "NoticeListPage";

export interface PageConfig {
  /** 페이지 ID (route 경로) */
  id: string;
  /** 사용할 컴포넌트 타입 */
  component: PageComponent;
  /** 속한 카테고리 ID */
  category: string;
  /** 카테고리 내 정렬 순서 (작을수록 위) */
  order: number;
  /** 
   * 카테고리의 첫 페이지 여부 
   * true면 StartFeaturesPage의 대메뉴 바로가기 카드에서 이 페이지로 연결
   */
  isFirstInCategory?: boolean;
}

// ========================================
// 📋 페이지 설정 (추가/수정/삭제는 여기서만!)
// ========================================

export const PAGE_CONFIGS: PageConfig[] = [
  // ========================================
  // 🚀 DMS 시작하기
  // ========================================
  {
    id: "start-features",
    component: "StartFeaturesPage",
    category: "start",
    order: 1,
    isFirstInCategory: true,
  },

  // ========================================
  // 🔐 DMS 로그인/회원가입
  // ========================================
  {
    id: "login-admin",
    component: "DefaultPage",
    category: "login",
    order: 1,
    isFirstInCategory: true,
  },
  {
    id: "login-member",
    component: "DefaultPage",
    category: "login",
    order: 2,
  },

  // ========================================
  // 📱 DMS-상식플러스(App)
  // ========================================
  {
    id: "app-intro",
    component: "DefaultPage",
    category: "app",
    order: 1,
    isFirstInCategory: true,
  },
  {
    id: "app-connection",
    component: "DefaultPage",
    category: "app",
    order: 2,
  },

  // ========================================
  // 👥 회원 관리
  // ========================================
  {
    id: "member-dashboard",
    component: "DefaultPage",
    category: "member",
    order: 1,
    isFirstInCategory: true,
  },
  {
    id: "member-info",
    component: "DefaultPage",
    category: "member",
    order: 2,
  },
  {
    id: "member-meal",
    component: "DefaultPage",
    category: "member",
    order: 3,
  },
  {
    id: "member-nutrition",
    component: "DefaultPage",
    category: "member",
    order: 4,
  },
  {
    id: "member-consult",
    component: "DefaultPage",
    category: "member",
    order: 5,
  },

  // ========================================
  // 🍽️ 레시피 관리
  // ========================================
  {
    id: "recipe-create",
    component: "DefaultPage",
    category: "recipe",
    order: 1,
    isFirstInCategory: true,
  },
  {
    id: "recipe-manage",
    component: "DefaultPage",
    category: "recipe",
    order: 2,
  },

  // ========================================
  // ⚙️ 설정
  // ========================================
  {
    id: "settings-institution",
    component: "DefaultPage",
    category: "settings",
    order: 1,
    isFirstInCategory: true,
  },
  {
    id: "settings-members",
    component: "DefaultPage",
    category: "settings",
    order: 2,
  },
  {
    id: "settings-etc",
    component: "DefaultPage",
    category: "settings",
    order: 3,
  },

  // ========================================
  // 📢 서비스 공지사항
  // ========================================
  {
    id: "notice-list",
    component: "NoticeListPage",
    category: "notice",
    order: 1,
    isFirstInCategory: true,
  },
];

// ========================================
// 🛠️ 헬퍼 함수
// ========================================

/**
 * 페이지 ID로 설정 조회
 */
export function getPageConfig(pageId: string): PageConfig | undefined {
  return PAGE_CONFIGS.find(config => config.id === pageId);
}

/**
 * 카테고리별로 페이지 그룹핑 (정렬 포함)
 */
export function getPagesByCategory(categoryId?: string): PageConfig[] {
  if (categoryId) {
    // 특정 카테고리의 페이지만 반환
    return PAGE_CONFIGS
      .filter(config => config.category === categoryId)
      .sort((a, b) => a.order - b.order);
  }
  
  // 전체 카테고리별 그룹핑
  const grouped = PAGE_CONFIGS.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, PageConfig[]>);
  
  // 각 카테고리 내부를 order로 정렬
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => a.order - b.order);
  });
  
  return grouped as any; // Record 반환을 위한 타입 캐스팅
}

/**
 * 카테고리의 첫 페이지 ID 조회 (대메뉴 바로가기용)
 */
export function getFirstPageId(categoryId: string): string {
  const firstPage = PAGE_CONFIGS.find(
    config => config.category === categoryId && config.isFirstInCategory
  );
  return firstPage?.id || "";
}

/**
 * 카테고리 순서 정의 (사이드바 표시 순서)
 */
export const CATEGORY_ORDER = [
  "start",
  "login",
  "app",
  "member",
  "recipe",
  "settings",
  "notice",
] as const;