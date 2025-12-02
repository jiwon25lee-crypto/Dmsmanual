import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

type Language = "ko" | "en";

// 🆕 페이지 레이아웃 타입 정의
export type PageLayout = "default" | "features" | "accordion";

// 🆕 페이지 메타데이터 인터페이스
export interface PageMetadata {
  layout: PageLayout;
  translationKey?: string; // 🆕 실제 번역에 사용되는 키 (pageId와 다를 수 있음)
  createdAt?: string;
  updatedAt?: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string | boolean;
  updateTranslation: (key: string, value: any, lang?: Language) => void;
  updatePageData: (pageId: string, data: any) => void;
  getPageLayout: (pageId: string) => PageLayout; // 🆕 레이아웃 가져오기
  setPageLayout: (pageId: string, layout: PageLayout) => void; // 🆕 레이아웃 설정
  getTranslationKey: (pageId: string) => string; // 🆕 번역 키 가져오기 (pageId와 다를 수 있음)
  addCategory: (id: string, nameKo: string, nameEn: string) => void; // 🆕 대메뉴 추가
  updateCategory: (categoryId: string, nameKo: string, nameEn: string) => void; // 🆕 대메뉴명 수정
  addPage: (pageId: string, nameKo: string, nameEn: string, layout: PageLayout) => void; // 🆕 소메뉴 추가
  deleteCategory: (categoryId: string) => void; // 🆕 대메뉴 삭제
  deletePage: (pageId: string) => void; // 🆕 소메뉴 삭제
  getAllCategories: () => string[]; // 🆕 전체 카테고리 목록
  getPagesByCategory: (categoryId: string) => string[]; // 🆕 카테고리별 페이지 목록
  getAllPages: () => Array<{ id: string; title: string; category: string }>; // 🆕 전체 페이지 목록
  reorderCategories: (newOrder: string[]) => void; // 🆕 대메뉴 순서 변경
  reorderPages: (categoryId: string, newOrder: string[]) => void; // 🆕 소메뉴 순서 변경
  saveChanges: () => Promise<boolean>; // 🆕 수동 저장
  getTranslation: (key: string, lang: Language) => string | boolean | undefined; // 🆕 특정 언어 번역 가져오기
  updateTrigger: number; // 🆕 업데이트 트리거 (PageEditor 리로드용)
}

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

// ========================================
// 🆕 페이지 메타데이터 (레이아웃 타입 저장)
// ========================================
// 각 페이지의 레이아웃 타입을 저장
// 신규 메뉴 생성 시 설정되며, 이후 변경 불가

const initialPageMetadata: Record<string, PageMetadata> = {
  // StartFeaturesPage (카드 그리드)
  "start-features": { layout: "features" },
  "start-intro": { layout: "features" },
  
  // DefaultPage (기본 레이아웃) - 대부분
  "start-login": { layout: "default" },
  "join-dms": { layout: "default" },
  "login-member": { layout: "default" },
  "member-register": { layout: "default" },
  "member-edit": { layout: "default" },
  "member-delete": { layout: "default" },
  "member-role": { layout: "default" },
  "member-approve": { layout: "default" },
  "board-list": { layout: "default" },
  "board-write": { layout: "default" },
  "board-edit": { layout: "default" },
  "board-delete": { layout: "default" },
  "board-comment": { layout: "default" },
  "notice-write": { layout: "default" },
  "notice-edit": { layout: "default" },
  "notice-delete": { layout: "default" },
  "notice-view": { layout: "default" },
  "schedule-add": { layout: "default" },
  "schedule-edit": { layout: "default" },
  "schedule-delete": { layout: "default" },
  "schedule-view": { layout: "default" },
  "library-upload": { layout: "default" },
  "library-download": { layout: "default" },
  "library-delete": { layout: "default" },
  "library-folder": { layout: "default" },
  
  // NoticeListPage (아코디언 레이아웃)
  "notice-list": { layout: "accordion", translationKey: "notice-list" },
};

const pageMetadata: Record<string, PageMetadata> = { ...initialPageMetadata };

// ========================================
// ✅ 공통 Visibility 제어 (모든 언어 공통 적용)
// ========================================
// 각 메뉴의 Step 표시 여부와 이미지 표시 여부를 boolean으로 제어
// true: 표시 / false: 숨김

const commonVisibility: Record<string, boolean> = {
  // ========================================
  // 📌 start-features (DMS 주요 기능) - StartFeaturesPage
  // ========================================
  "start-features.feature1.visible": true,
  "start-features.feature2.visible": true,
  "start-features.feature3.visible": true,
  "start-features.feature4.visible": true,
  "start-features.feature5.visible": true,
  "start-features.feature6.visible": true,
  "start-features.feature7.visible": true,
  "start-features.feature8.visible": true,

  // ========================================
  // 📌 start-login (로그인/회원가입) - DefaultPage
  // ========================================
  "start-login.step1.visible": true,
  "start-login.step1.image-visible": true,
  "start-login.step2.visible": true,
  "start-login.step2.image-visible": true,
  "start-login.step3.visible": true,
  "start-login.step3.image-visible": true,
  "start-login.step4.visible": true,
  "start-login.step4.image-visible": true,
  "start-login.step5.visible": true,
  "start-login.step5.image-visible": true,
  "start-login.step6.visible": true,
  "start-login.step6.image-visible": true,
  "start-login.step7.visible": true,
  "start-login.step7.image-visible": true,
  "start-login.step8.visible": true,
  "start-login.step8.image-visible": true,
  "start-login.step9.visible": true,
  "start-login.step9.image-visible": true,
  "start-login.step10.visible": true,
  "start-login.step10.image-visible": true,

  // ========================================
  // 📌 join-dms (기관 대표 관리자 회원가입) - DefaultPage
  // ========================================
  "join-dms.step1.visible": true,
  "join-dms.step1.image-visible": true,
  "join-dms.step2.visible": true,
  "join-dms.step2.image-visible": true,
  "join-dms.step3.visible": true,
  "join-dms.step3.image-visible": true,
  "join-dms.step4.visible": true,
  "join-dms.step4.image-visible": true,
  "join-dms.step5.visible": true,
  "join-dms.step5.image-visible": true,
  "join-dms.step6.visible": true,
  "join-dms.step6.image-visible": true,
  "join-dms.step7.visible": true,
  "join-dms.step7.image-visible": true,
  "join-dms.step8.visible": true,
  "join-dms.step8.image-visible": true,
  "join-dms.step9.visible": true,
  "join-dms.step9.image-visible": true,
  "join-dms.step10.visible": true,
  "join-dms.step10.image-visible": true,

  // ========================================
  // 📌 login-member (구성원 초대 및 구성원 회원 가입) - DefaultPage
  // ========================================
  "login-member.step1.visible": true,
  "login-member.step1.image-visible": true,
  "login-member.step2.visible": true,
  "login-member.step2.image-visible": true,
  "login-member.step3.visible": true,
  "login-member.step3.image-visible": true,
  "login-member.step4.visible": true,
  "login-member.step4.image-visible": true,
  "login-member.step5.visible": true,
  "login-member.step5.image-visible": true,
  "login-member.step6.visible": true,
  "login-member.step6.image-visible": true,
  "login-member.step7.visible": true,
  "login-member.step7.image-visible": true,
  "login-member.step8.visible": true,
  "login-member.step8.image-visible": true,
  "login-member.step9.visible": true,
  "login-member.step9.image-visible": true,
  "login-member.step10.visible": true,
  "login-member.step10.image-visible": true,

  // ========================================
  // 📌 app-intro (DMS-상식플러스(App) 연동 - App 소개) - DefaultPage
  // ========================================
  "app-intro.step1.visible": true,
  "app-intro.step1.image-visible": true,
  "app-intro.step2.visible": true,
  "app-intro.step2.image-visible": true,
  "app-intro.step3.visible": true,
  "app-intro.step3.image-visible": true,
  "app-intro.step4.visible": true,
  "app-intro.step4.image-visible": true,
  "app-intro.step5.visible": true,
  "app-intro.step5.image-visible": true,
  "app-intro.step6.visible": true,
  "app-intro.step6.image-visible": true,
  "app-intro.step7.visible": true,
  "app-intro.step7.image-visible": true,
  "app-intro.step8.visible": true,
  "app-intro.step8.image-visible": true,
  "app-intro.step9.visible": true,
  "app-intro.step9.image-visible": true,
  "app-intro.step10.visible": true,
  "app-intro.step10.image-visible": true,

  // ========================================
  // 📌 app-connection (DMS-상식플러스(App) 연동) - DefaultPage
  // ========================================
  "app-connection.step1.visible": true,
  "app-connection.step1.image-visible": true,
  "app-connection.step2.visible": true,
  "app-connection.step2.image-visible": true,
  "app-connection.step3.visible": true,
  "app-connection.step3.image-visible": true,
  "app-connection.step4.visible": true,
  "app-connection.step4.image-visible": true,
  "app-connection.step5.visible": true,
  "app-connection.step5.image-visible": true,
  "app-connection.step6.visible": true,
  "app-connection.step6.image-visible": true,
  "app-connection.step7.visible": true,
  "app-connection.step7.image-visible": true,
  "app-connection.step8.visible": true,
  "app-connection.step8.image-visible": true,
  "app-connection.step9.visible": true,
  "app-connection.step9.image-visible": true,
  "app-connection.step10.visible": true,
  "app-connection.step10.image-visible": true,

  // ========================================
  // 📌 member-dashboard (회원 대시보드) - DefaultPage
  // ========================================
  "member-dashboard.step1.visible": true,
  "member-dashboard.step1.image-visible": true,
  "member-dashboard.step2.visible": true,
  "member-dashboard.step2.image-visible": true,
  "member-dashboard.step3.visible": true,
  "member-dashboard.step3.image-visible": true,
  "member-dashboard.step4.visible": true,
  "member-dashboard.step4.image-visible": true,
  "member-dashboard.step5.visible": true,
  "member-dashboard.step5.image-visible": true,
  "member-dashboard.step6.visible": true,
  "member-dashboard.step6.image-visible": true,
  "member-dashboard.step7.visible": true,
  "member-dashboard.step7.image-visible": true,
  "member-dashboard.step8.visible": true,
  "member-dashboard.step8.image-visible": true,
  "member-dashboard.step9.visible": true,
  "member-dashboard.step9.image-visible": true,
  "member-dashboard.step10.visible": true,
  "member-dashboard.step10.image-visible": true,

  // ========================================
  // 📌 member-info (회원 정보 관리) - DefaultPage
  // ========================================
  "member-info.step1.visible": true,
  "member-info.step1.image-visible": true,
  "member-info.step2.visible": true,
  "member-info.step2.image-visible": true,
  "member-info.step3.visible": true,
  "member-info.step3.image-visible": true,
  "member-info.step4.visible": true,
  "member-info.step4.image-visible": true,
  "member-info.step5.visible": true,
  "member-info.step5.image-visible": true,
  "member-info.step6.visible": true,
  "member-info.step6.image-visible": true,
  "member-info.step7.visible": true,
  "member-info.step7.image-visible": true,
  "member-info.step8.visible": true,
  "member-info.step8.image-visible": true,
  "member-info.step9.visible": true,
  "member-info.step9.image-visible": true,
  "member-info.step10.visible": true,
  "member-info.step10.image-visible": true,

  // ========================================
  // 📌 member-meal (식사 기록 관리) - DefaultPage
  // ========================================
  "member-meal.step1.visible": true,
  "member-meal.step1.image-visible": true,
  "member-meal.step2.visible": true,
  "member-meal.step2.image-visible": true,
  "member-meal.step3.visible": true,
  "member-meal.step3.image-visible": true,
  "member-meal.step4.visible": true,
  "member-meal.step4.image-visible": true,
  "member-meal.step5.visible": true,
  "member-meal.step5.image-visible": true,
  "member-meal.step6.visible": true,
  "member-meal.step6.image-visible": true,
  "member-meal.step7.visible": true,
  "member-meal.step7.image-visible": true,
  "member-meal.step8.visible": true,
  "member-meal.step8.image-visible": true,
  "member-meal.step9.visible": true,
  "member-meal.step9.image-visible": true,
  "member-meal.step10.visible": true,
  "member-meal.step10.image-visible": true,

  // ========================================
  // 📌 member-nutrition (영양 리포트) - DefaultPage
  // ========================================
  "member-nutrition.step1.visible": true,
  "member-nutrition.step1.image-visible": true,
  "member-nutrition.step2.visible": true,
  "member-nutrition.step2.image-visible": true,
  "member-nutrition.step3.visible": true,
  "member-nutrition.step3.image-visible": true,
  "member-nutrition.step4.visible": true,
  "member-nutrition.step4.image-visible": true,
  "member-nutrition.step5.visible": true,
  "member-nutrition.step5.image-visible": true,
  "member-nutrition.step6.visible": true,
  "member-nutrition.step6.image-visible": true,
  "member-nutrition.step7.visible": true,
  "member-nutrition.step7.image-visible": true,
  "member-nutrition.step8.visible": true,
  "member-nutrition.step8.image-visible": true,
  "member-nutrition.step9.visible": true,
  "member-nutrition.step9.image-visible": true,
  "member-nutrition.step10.visible": true,
  "member-nutrition.step10.image-visible": true,

  // ========================================
  // 📌 member-consult (온라인 상담) - DefaultPage
  // ========================================
  "member-consult.step1.visible": true,
  "member-consult.step1.image-visible": true,
  "member-consult.step2.visible": true,
  "member-consult.step2.image-visible": true,
  "member-consult.step3.visible": true,
  "member-consult.step3.image-visible": true,
  "member-consult.step4.visible": true,
  "member-consult.step4.image-visible": true,
  "member-consult.step5.visible": true,
  "member-consult.step5.image-visible": true,
  "member-consult.step6.visible": true,
  "member-consult.step6.image-visible": true,
  "member-consult.step7.visible": true,
  "member-consult.step7.image-visible": true,
  "member-consult.step8.visible": true,
  "member-consult.step8.image-visible": true,
  "member-consult.step9.visible": true,
  "member-consult.step9.image-visible": true,
  "member-consult.step10.visible": true,
  "member-consult.step10.image-visible": true,

  // ========================================
  // 📌 recipe-create (레시피 생성) - DefaultPage
  // ========================================
  "recipe-create.step1.visible": true,
  "recipe-create.step1.image-visible": true,
  "recipe-create.step2.visible": true,
  "recipe-create.step2.image-visible": true,
  "recipe-create.step3.visible": true,
  "recipe-create.step3.image-visible": true,
  "recipe-create.step4.visible": true,
  "recipe-create.step4.image-visible": true,
  "recipe-create.step5.visible": true,
  "recipe-create.step5.image-visible": true,
  "recipe-create.step6.visible": true,
  "recipe-create.step6.image-visible": true,
  "recipe-create.step7.visible": true,
  "recipe-create.step7.image-visible": true,
  "recipe-create.step8.visible": true,
  "recipe-create.step8.image-visible": true,
  "recipe-create.step9.visible": true,
  "recipe-create.step9.image-visible": true,
  "recipe-create.step10.visible": true,
  "recipe-create.step10.image-visible": true,

  // ========================================
  // 📌 recipe-manage (레시피 관리) - DefaultPage
  // ========================================
  "recipe-manage.step1.visible": true,
  "recipe-manage.step1.image-visible": true,
  "recipe-manage.step2.visible": true,
  "recipe-manage.step2.image-visible": true,
  "recipe-manage.step3.visible": true,
  "recipe-manage.step3.image-visible": true,
  "recipe-manage.step4.visible": true,
  "recipe-manage.step4.image-visible": true,
  "recipe-manage.step5.visible": true,
  "recipe-manage.step5.image-visible": true,
  "recipe-manage.step6.visible": true,
  "recipe-manage.step6.image-visible": true,
  "recipe-manage.step7.visible": true,
  "recipe-manage.step7.image-visible": true,
  "recipe-manage.step8.visible": true,
  "recipe-manage.step8.image-visible": true,
  "recipe-manage.step9.visible": true,
  "recipe-manage.step9.image-visible": true,
  "recipe-manage.step10.visible": true,
  "recipe-manage.step10.image-visible": true,

  // ========================================
  // 📌 settings-institution (기관 설정) - DefaultPage
  // ========================================
  "settings-institution.step1.visible": true,
  "settings-institution.step1.image-visible": true,
  "settings-institution.step2.visible": true,
  "settings-institution.step2.image-visible": true,
  "settings-institution.step3.visible": true,
  "settings-institution.step3.image-visible": true,
  "settings-institution.step4.visible": true,
  "settings-institution.step4.image-visible": true,
  "settings-institution.step5.visible": true,
  "settings-institution.step5.image-visible": true,
  "settings-institution.step6.visible": true,
  "settings-institution.step6.image-visible": true,
  "settings-institution.step7.visible": true,
  "settings-institution.step7.image-visible": true,
  "settings-institution.step8.visible": true,
  "settings-institution.step8.image-visible": true,
  "settings-institution.step9.visible": true,
  "settings-institution.step9.image-visible": true,
  "settings-institution.step10.visible": true,
  "settings-institution.step10.image-visible": true,

  // ========================================
  // 📌 settings-members (기관 구성원 관리) - DefaultPage
  // ========================================
  "settings-members.step1.visible": true,
  "settings-members.step1.image-visible": true,
  "settings-members.step2.visible": true,
  "settings-members.step2.image-visible": true,
  "settings-members.step3.visible": true,
  "settings-members.step3.image-visible": true,
  "settings-members.step4.visible": true,
  "settings-members.step4.image-visible": true,
  "settings-members.step5.visible": true,
  "settings-members.step5.image-visible": true,
  "settings-members.step6.visible": true,
  "settings-members.step6.image-visible": true,
  "settings-members.step7.visible": true,
  "settings-members.step7.image-visible": true,
  "settings-members.step8.visible": true,
  "settings-members.step8.image-visible": true,
  "settings-members.step9.visible": true,
  "settings-members.step9.image-visible": true,
  "settings-members.step10.visible": true,
  "settings-members.step10.image-visible": true,

  // ========================================
  // 📌 settings-etc (기타 설정) - DefaultPage
  // ========================================
  "settings-etc.step1.visible": true,
  "settings-etc.step1.image-visible": true,
  "settings-etc.step2.visible": true,
  "settings-etc.step2.image-visible": true,
  "settings-etc.step3.visible": true,
  "settings-etc.step3.image-visible": true,
  "settings-etc.step4.visible": true,
  "settings-etc.step4.image-visible": true,
  "settings-etc.step5.visible": true,
  "settings-etc.step5.image-visible": true,
  "settings-etc.step6.visible": true,
  "settings-etc.step6.image-visible": true,
  "settings-etc.step7.visible": true,
  "settings-etc.step7.image-visible": true,
  "settings-etc.step8.visible": true,
  "settings-etc.step8.image-visible": true,
  "settings-etc.step9.visible": true,
  "settings-etc.step9.image-visible": true,
  "settings-etc.step10.visible": true,
  "settings-etc.step10.image-visible": true,

  // ========================================
  // 📌 notice-list (공지사항) - NoticeListPage
  // ========================================
  "notice-list.notice1.visible": false,
  "notice-list.notice1.isImportant": false,
  "notice-list.notice1.isNew": false,
  
  "notice-list.notice2.visible": false,
  "notice-list.notice2.isImportant": false,
  "notice-list.notice2.isNew": false,
  
  "notice-list.notice3.visible": false,
  "notice-list.notice3.isImportant": false,
  "notice-list.notice3.isNew": false,
  
  "notice-list.notice4.visible": false,
  "notice-list.notice4.isImportant": false,
  "notice-list.notice4.isNew": false,
  
  "notice-list.notice5.visible": false,
  "notice-list.notice5.isImportant": false,
  "notice-list.notice5.isNew": false,

  // ========================================
  // 📌 default (기본 페이지 - 사용하지 않음)
  // ========================================
  "default.step1.visible": true,
  "default.step1.image-visible": true,
  "default.step2.visible": true,
  "default.step2.image-visible": true,
  "default.step3.visible": true,
  "default.step3.image-visible": true,
  "default.step4.visible": false,
  "default.step4.image-visible": false,
  "default.step5.visible": false,
  "default.step5.image-visible": false,
  "default.step6.visible": false,
  "default.step6.image-visible": false,
  "default.step7.visible": false,
  "default.step7.image-visible": false,
  "default.step8.visible": false,
  "default.step8.image-visible": false,
  "default.step9.visible": false,
  "default.step9.image-visible": false,
  "default.step10.visible": false,
  "default.step10.image-visible": false,
};

// ========================================
// 📚 번역 데이터 (한국어/영어)
// ========================================

const translations: Record<Language, Record<string, string | boolean>> = {
  ko: {
    // ========================================
    // 🔹 공통 (Common)
    // ========================================
    "admin.title": "DMS",
    "admin.manual": "DMS 사용 가이드",

    // ========================================
    // 🔹 카테고리 (Categories)
    // ========================================
    "category.start": "DMS 시작하기",
    "category.login": "DMS 로그인/회원가입",
    "category.app": "DMS-상식플러스(App) 연동",
    "category.member": "DMS 회원 관리",
    "category.recipe": "기관 레시피 관리",
    "category.settings": "DMS 설정",
    "category.notice": "서비스 공지사항",

    // ========================================
    // 🔹 사이드바 메뉴 (Sidebar Sections)
    // ========================================
    // DMS 시작하기
    "section.start.features": "DMS 시작하기",
    
    // DMS 로그인/회원가입
    "section.login.admin": "기관 대표 ��리자 회원가입",
    "section.login.member": "구성원 초대 및 구성원 회원 가입",

    // DMS-상식플러스(App) 연동
    "section.app.intro": "App - 상식플러스 소개",
    "section.app.connection": "DMS-상식플러스(App) 연결",

    // DMS 회원 관리
    "section.member.dashboard": "대시보드",
    "section.member.info": "회원 정보 관리",
    "section.member.meal": "식사 기록 관리",
    "section.member.nutrition": "영양 리포트",
    "section.member.consult": "온라인 상담",

    // 기관 레시피 관리
    "section.recipe.create": "레시피 생성",
    "section.recipe.manage": "레시피 관리",

    // DMS 설정
    "section.settings.institution": "기관 설정",
    "section.settings.members": "기관 구성원 관리",
    "section.settings.etc": "기타 설정",
    
    // 공지사항
    "section.notice.list": "공지사항 목록",

    // ========================================
    // 📄 start-features (DMS 시작하기) - StartFeaturesPage
    // ========================================
    "start-features.title": "DMS 시작하기",
    "start-features.intro":
      "DMS의 주요 기능을 카테고리별로 확인하고, 필요한 매뉴얼로 바로 이동할 수 있습니다.",
    
    // 🆕 Feature 카드 (백오피스 편집 가능)
    "start-features.feature1.title": "DMS 시작하기",
    "start-features.feature1.desc":
      "DMS 로그인, 회원가입 방법을 확인하고 처음 사용을 시작하세요.",
    "start-features.feature1.icon": "🚀",
    
    "start-features.feature2.title": "DMS-상식플러스(App) 연동",
    "start-features.feature2.desc":
      "모바일 앱 소개와 DMS와의 연동 방법을 안내합니다.",
    "start-features.feature2.icon": "📱",
    
    "start-features.feature3.title": "DMS 회원 관리",
    "start-features.feature3.desc":
      "회원 정보, 식사 기록, 영양 리포트, 온라인 상담을 관리하세요.",
    "start-features.feature3.icon": "👥",
    
    "start-features.feature4.title": "기관 레시피 관리",
    "start-features.feature4.desc":
      "기관 맞춤형 레시피를 생성하고 회원에게 제공하세요.",
    "start-features.feature4.icon": "🍽️",
    
    "start-features.feature5.title": "DMS 설정",
    "start-features.feature5.desc":
      "기관 정보, 구성원 관리, 기타 설정을 변경할 수 있습니다.",
    "start-features.feature5.icon": "⚙️",
    
    "start-features.tip-title": "매뉴얼 활용 가이드",
    "start-features.tip-desc":
      "위 카테고리를 클릭하면 해당 섹션으로 바로 이동합니다. 왼쪽 사이드바에서 세부 메뉴를 선택하여 상세한 매뉴얼을 확인하세요.",

    // ========================================
    // 📄 start-login (DMS 로그인/회원가입) - DefaultPage
    // ========================================
    "start-login.title": "DMS 로그인/회원가입",
    "start-login.intro":
      "DMS 백오피스에 처음 접속하거나 계정을 관리하는 방법을 안내합니다. 기관 관리자와 구성원의 가입 절차를 확인하세요.",
    "start-login.guide-title": "로그인/회원가입 가이드",
    "start-login.step1.title": "무료 체험 신청",
    "start-login.step1.desc":
      "DMS 홈페이지에서 '무료 체험' 버튼을 클릭하거나, 백오피스 로그인 페이지에서 '회원가입' 버튼을 클릭합니다.",
    "start-login.step1.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "start-login.step2.title": "기본 정보 입력",
    "start-login.step2.desc":
      "기관명, 담당자 이름, 이메일 주소, 비밀번호를 입력합니다. 이메일 주소는 로그인 ID로 사용되며, 중요한 알림을 받을 수 있으므로 정확하게 입력하세요.",
    "start-login.step2.image":
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=400&fit=crop",
    "start-login.step3.title": "이메일 인증",
    "start-login.step3.desc":
      "입력한 이메일 주소로 발송된 인증 메일을 확인하고, 메일 내의 '이메일 인증' 버튼을 클릭하여 본인 인증을 완료합니다.",
    "start-login.step3.image":
      "https://images.unsplash.com/photo-1579275542618-a1dfed5f54ba?w=800&h=400&fit=crop",
    "start-login.step4.title": "로그인 및 시작",
    "start-login.step4.desc":
      "이메일 인증이 완료되면 로그인 페이지로 이동하여 가입 시 입력한 이메일과 비밀번호로 로그인합니다.",
    "start-login.step4.image":
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
    "start-login.step5.title": "",
    "start-login.step5.desc": "",
    "start-login.step5.image": "",
    "start-login.step6.title": "",
    "start-login.step6.desc": "",
    "start-login.step6.image": "",
    "start-login.step7.title": "",
    "start-login.step7.desc": "",
    "start-login.step7.image": "",
    "start-login.step8.title": "",
    "start-login.step8.desc": "",
    "start-login.step8.image": "",
    "start-login.step9.title": "",
    "start-login.step9.desc": "",
    "start-login.step9.image": "",
    "start-login.step10.title": "",
    "start-login.step10.desc": "",
    "start-login.step10.image": "",

    // ========================================
    // 📄 join-dms (기관 대표 관리자 회원가입) - DefaultPage
    // ========================================
    "join-dms.title": "기관 대표 관리자 회원가입",
    "join-dms.intro":
      "기관의 대표 관리자로 DMS에 가입하는 방법을 안내합니다. 대표 관리자는 기관의 모든 설정을 관리하고 구성원을 초대할 수 있는 최고 권한을 가집니다.",
    "join-dms.guide-title": "기관 대표 관리자 회원가입 절차",
    "join-dms.step1.title": "무료 체험 신청 페이지 접속",
    "join-dms.step1.desc":
      "DMS 홈페이지(https://admin.dms.doinglab.com)에 접속하여 '무료 체험' 또는 '회원가입' 버튼을 클릭합니다.",
    "join-dms.step1.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "join-dms.step2.title": "기관 정보 입력",
    "join-dms.step2.desc":
      "기관명, 사업자등록번호(선택), 기관 주소 등 기관의 기본 정보를 입력합니다.",
    "join-dms.step2.image":
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop",
    "join-dms.step3.title": "대표 관리자 정보 입력",
    "join-dms.step3.desc":
      "이름, 이메일 주소, 비밀번호, 연락처를 입력합니다. 이메일 주소는 로그인 ID로 사용됩니다.",
    "join-dms.step3.image":
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=400&fit=crop",
    "join-dms.step4.title": "이메일 인증",
    "join-dms.step4.desc":
      "입력한 이메일로 발송된 인증 메일을 확인하고, '이메일 인증' 버튼을 클릭하여 본인 인증을 완료합니다.",
    "join-dms.step4.image":
      "https://images.unsplash.com/photo-1579275542618-a1dfed5f54ba?w=800&h=400&fit=crop",
    "join-dms.step5.title": "로그인 및 기관 설정",
    "join-dms.step5.desc":
      "이메일 인증 완료 후 로그인하여 기관의 세부 설정(영양 기준, 알림 설정 등)을 진행합니다.",
    "join-dms.step5.image":
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
    "join-dms.step6.title": "",
    "join-dms.step6.desc": "",
    "join-dms.step6.image": "",
    "join-dms.step7.title": "",
    "join-dms.step7.desc": "",
    "join-dms.step7.image": "",
    "join-dms.step8.title": "",
    "join-dms.step8.desc": "",
    "join-dms.step8.image": "",
    "join-dms.step9.title": "",
    "join-dms.step9.desc": "",
    "join-dms.step9.image": "",
    "join-dms.step10.title": "",
    "join-dms.step10.desc": "",
    "join-dms.step10.image": "",

    // ========================================
    // 📄 login-member (구성원 초대 및 구성원 회원 가입) - DefaultPage
    // ========================================
    "login-member.title": "구성원 초대 및 구성원 회원 가입",
    "login-member.intro":
      "기관의 구성원(영양사, 상담사 등)을 초대하고, 초대받은 구성원이 DMS에 가입하는 방법을 안내합니다.",
    "login-member.guide-title": "구성원 초대 및 가입 절차",
    "login-member.step1.title": "대표 관리자: 구성원 초대하기",
    "login-member.step1.desc":
      "대표 관리자가 'DMS 설정 > 기관 구성원 관리' 메뉴에서 '구성원 초대' 버튼을 클릭하고, 초대할 구성원의 이메일 주소와 권한을 입력합니다.",
    "login-member.step1.image":
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    "login-member.step2.title": "구성원: 초대 이메일 확인",
    "login-member.step2.desc":
      "초대받은 구성원은 이메일로 발송된 초대 메일을 확인하고, '초대 승인' 또는 '가입하기' 버튼을 클릭합니다.",
    "login-member.step2.image":
      "https://images.unsplash.com/photo-1579275542618-a1dfed5f54ba?w=800&h=400&fit=crop",
    "login-member.step3.title": "구성원 정보 입력",
    "login-member.step3.desc":
      "이름, 비밀번호, 연락처 등 본인의 정보를 입력하여 회원가입을 완료합니다. 이메일 주소는 초대 메일로 자동 입력됩니다.",
    "login-member.step3.image":
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=400&fit=crop",
    "login-member.step4.title": "로그인 및 업무 시작",
    "login-member.step4.desc":
      "가입 완료 후 로그인하여 부여받은 권한에 따라 회원 관리, 상담 기록 등의 업무를 시작합니다.",
    "login-member.step4.image":
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
    "login-member.step5.title": "",
    "login-member.step5.desc": "",
    "login-member.step5.image": "",
    "login-member.step6.title": "",
    "login-member.step6.desc": "",
    "login-member.step6.image": "",
    "login-member.step7.title": "",
    "login-member.step7.desc": "",
    "login-member.step7.image": "",
    "login-member.step8.title": "",
    "login-member.step8.desc": "",
    "login-member.step8.image": "",
    "login-member.step9.title": "",
    "login-member.step9.desc": "",
    "login-member.step9.image": "",
    "login-member.step10.title": "",
    "login-member.step10.desc": "",
    "login-member.step10.image": "",

    // ========================================
    // 📄 app-intro (DMS-��식플러스(App) 연동 - App 소개) - DefaultPage
    // ========================================
    "app-intro.title": "App - 상식플러스 소개",
    "app-intro.intro":
      "상식플러스는 회원이 직접 식단을 기록하고 영양 정보를 확인할 수 있는 모바일 앱입니다. DMS와 연동하여 실시간으로 데이터를 동기화합니다.",
    "app-intro.guide-title": "상식플러스 앱 주요 기능",
    "app-intro.step1.title": "식단 사진 촬영 및 기록",
    "app-intro.step1.desc":
      "회원이 식사 사진을 촬영하여 간편하게 기록하고, AI가 자동으로 음식을 인식합니다.",
    "app-intro.step1.image":
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop",
    "app-intro.step2.title": "영양 분석 확인",
    "app-intro.step2.desc":
      "기록한 식단의 칼로리, 탄수화물, 단백질, 지방 등 영양소를 실시간으로 확인할 수 있습니다.",
    "app-intro.step2.image":
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop",
    "app-intro.step3.title": "상담사와 실시간 소통",
    "app-intro.step3.desc":
      "영양 상담사의 피드백을 받고 1:1 채팅으로 소통할 수 있습니다.",
    "app-intro.step3.image":
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    "app-intro.step4.title": "",
    "app-intro.step4.desc": "",
    "app-intro.step4.image": "",
    "app-intro.step5.title": "",
    "app-intro.step5.desc": "",
    "app-intro.step5.image": "",
    "app-intro.step6.title": "",
    "app-intro.step6.desc": "",
    "app-intro.step6.image": "",
    "app-intro.step7.title": "",
    "app-intro.step7.desc": "",
    "app-intro.step7.image": "",
    "app-intro.step8.title": "",
    "app-intro.step8.desc": "",
    "app-intro.step8.image": "",
    "app-intro.step9.title": "",
    "app-intro.step9.desc": "",
    "app-intro.step9.image": "",
    "app-intro.step10.title": "",
    "app-intro.step10.desc": "",
    "app-intro.step10.image": "",

    // ========================================
    // 📄 app-connection (DMS-상식플러스(App) 연동) - DefaultPage
    // ========================================
    "app-connection.title": "DMS-상식플러스(App) 연결",
    "app-connection.header-image": "LANG_SPECIFIC_IMAGE", // PageImages.tsx에서 관리
    "app-connection.intro":
      "DMS 백오피스와 상식플러스 앱을 연동하여 회원 데이터를 실시간으로 동기화하는 방법을 안내합니다.",
    "app-connection.guide-title": "앱 연동 가이드",
    "app-connection.step1.title": "기관 설정 메뉴 접속",
    "app-connection.step1.desc":
      "DMS 백오피스 좌측 메뉴에서 '설정' > '기관 설정'을 선택합니다.",
    "app-connection.step1.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "app-connection.step2.title": "앱 연동 활성화",
    "app-connection.step2.desc":
      "기관 설정 페이지에서 '앱 연동' 섹션을 찾아 '연동 활성화' 버튼을 클릭합니다.",
    "app-connection.step2.image":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    "app-connection.step3.title": "기관 코드 확인",
    "app-connection.step3.desc":
      "연동 활성화 후 생성된 고유 기관 코드를 확인하고 복사합니다. 이 코드는 회원이 앱에서 기관을 찾을 때 사용됩니다.",
    "app-connection.step3.image":
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
    "app-connection.step4.title": "회원에게 기관 코드 전달",
    "app-connection.step4.desc":
      "복사한 기관 코드를 회원에게 문자, 이메일 등으로 전달하여 앱에서 입력하도록 안내합니다.",
    "app-connection.step4.image":
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop",
    "app-connection.step5.title": "연동 상태 확인",
    "app-connection.step5.desc":
      "회원이 앱에서 기관 코드를 입력하고 연동하면, DMS 대시보드에서 연동 회원 수를 실시간으로 확인할 수 있습니다.",
    "app-connection.step5.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "app-connection.step6.title": "",
    "app-connection.step6.desc": "",
    "app-connection.step6.image": "",
    "app-connection.step7.title": "",
    "app-connection.step7.desc": "",
    "app-connection.step7.image": "",
    "app-connection.step8.title": "",
    "app-connection.step8.desc": "",
    "app-connection.step8.image": "",
    "app-connection.step9.title": "",
    "app-connection.step9.desc": "",
    "app-connection.step9.image": "",
    "app-connection.step10.title": "",
    "app-connection.step10.desc": "",
    "app-connection.step10.image": "",

    // ========================================
    // 📄 member-dashboard (대시보드) - DefaultPage
    // ========================================
    "member-dashboard.title": "회원 관리 대시보드",
    "member-dashboard.intro":
      "전체 회원 ��황, 식단 기록, 영양 분석 등 주요 지표를 한눈에 확인할 수 있는 대시보드입니다.",
    "member-dashboard.guide-title": "대시보드 사용 가이드",
    "member-dashboard.step1.title": "대시보드 접속",
    "member-dashboard.step1.desc":
      "좌측 메뉴에서 '회원 관리' > '대시보드'를 선택하여 메인 ���시보드 화면으로 이동합니다.",
    "member-dashboard.step1.image":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    "member-dashboard.step2.title": "주요 지표 확인",
    "member-dashboard.step2.desc":
      "화면 상단의 주요 지표 카드를 통해 전체 회원 수, 오늘의 식단 기록, 평균 영양 점수 등을 한눈에 확인합니다.",
    "member-dashboard.step2.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "member-dashboard.step3.title": "필터 및 기간 설정",
    "member-dashboard.step3.desc":
      "날짜, 회원 그룹, 활동 상태 등의 필터를 설정하여 원하는 데이터를 선택적으로 조회하고 분석합니다.",
    "member-dashboard.step3.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "member-dashboard.step4.title": "",
    "member-dashboard.step4.desc": "",
    "member-dashboard.step4.image": "",
    "member-dashboard.step5.title": "",
    "member-dashboard.step5.desc": "",
    "member-dashboard.step5.image": "",
    "member-dashboard.step6.title": "",
    "member-dashboard.step6.desc": "",
    "member-dashboard.step6.image": "",
    "member-dashboard.step7.title": "",
    "member-dashboard.step7.desc": "",
    "member-dashboard.step7.image": "",
    "member-dashboard.step8.title": "",
    "member-dashboard.step8.desc": "",
    "member-dashboard.step8.image": "",
    "member-dashboard.step9.title": "",
    "member-dashboard.step9.desc": "",
    "member-dashboard.step9.image": "",
    "member-dashboard.step10.title": "",
    "member-dashboard.step10.desc": "",
    "member-dashboard.step10.image": "",

    // ========================================
    // 📄 member-info (회원 정보 관리) - DefaultPage
    // ========================================
    "member-info.title": "회원 정보 관리",
    "member-info.intro":
      "기관에 등록된 회원의 기본 정보와 건강 정보를 조회하고 수정할 수 있습니다.",
    "member-info.guide-title": "회원 정보 관리 가이드",
    "member-info.step1.title": "회원 목록 조회",
    "member-info.step1.desc":
      "'회원 관리' > '회원 정보 관리' 메뉴에서 등록된 전체 회원 목록을 확인할 수 있습니다.",
    "member-info.step1.image":
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=400&fit=crop",
    "member-info.step2.title": "회원 검색",
    "member-info.step2.desc":
      "이름, 이메일, 전화번호 등으로 회원을 검색하여 빠르게 찾을 수 있습니다.",
    "member-info.step2.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "member-info.step3.title": "회원 정보 상세 조회",
    "member-info.step3.desc":
      "회원 이름을 클릭하면 기본 정보, 건강 정보, 식단 기록 히스토리 등을 상세하게 확인할 수 있습니다.",
    "member-info.step3.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "member-info.step4.title": "회원 정보 수정",
    "member-info.step4.desc":
      "회원 상세 페이지에서 '수정' 버튼을 클릭하여 기본 정보와 건강 정보를 업데이트할 수 있습니다.",
    "member-info.step4.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "member-info.step5.title": "",
    "member-info.step5.desc": "",
    "member-info.step5.image": "",
    "member-info.step6.title": "",
    "member-info.step6.desc": "",
    "member-info.step6.image": "",
    "member-info.step7.title": "",
    "member-info.step7.desc": "",
    "member-info.step7.image": "",
    "member-info.step8.title": "",
    "member-info.step8.desc": "",
    "member-info.step8.image": "",
    "member-info.step9.title": "",
    "member-info.step9.desc": "",
    "member-info.step9.image": "",
    "member-info.step10.title": "",
    "member-info.step10.desc": "",
    "member-info.step10.image": "",

    // ========================================
    // 📄 member-meal (식사 기록 관리) - DefaultPage
    // ========================================
    "member-meal.title": "식사 기록 관리",
    "member-meal.intro":
      "회원들의 아침, 점심, 저녁, 간식 기록을 사진과 함께 확인하고 피드백을 제공할 수 있습니다.",
    "member-meal.guide-title": "식사 기록 관리 가이드",
    "member-meal.step1.title": "식사 기록 조회",
    "member-meal.step1.desc":
      "'회원 관리' > '식사 기록 관리'에서 회원별, 날짜별 식사 기록을 조회할 수 있습니다.",
    "member-meal.step1.image":
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop",
    "member-meal.step2.title": "식사 사진 확인",
    "member-meal.step2.desc":
      "회원이 업로드한 식사 사진을 클릭하여 크게 보고, AI가 분석한 음식 정보를 확인합니다.",
    "member-meal.step2.image":
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop",
    "member-meal.step3.title": "영양소 자동 분석",
    "member-meal.step3.desc":
      "AI가 자동으로 분석한 칼로리, 탄수화물, 단백질, 지방 정보를 확인하고 필요 시 수정할 수 있습니다.",
    "member-meal.step3.image":
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop",
    "member-meal.step4.title": "피드백 작성",
    "member-meal.step4.desc":
      "식사 기록에 대한 피드백을 작성하면 회원에게 푸시 알림으로 전송됩니다.",
    "member-meal.step4.image":
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    "member-meal.step5.title": "기록 내보내기",
    "member-meal.step5.desc":
      "특정 기간의 식사 기록을 엑셀 또는 PDF 형식으로 내보낼 수 있습니다.",
    "member-meal.step5.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "member-meal.step6.title": "",
    "member-meal.step6.desc": "",
    "member-meal.step6.image": "",
    "member-meal.step7.title": "",
    "member-meal.step7.desc": "",
    "member-meal.step7.image": "",
    "member-meal.step8.title": "",
    "member-meal.step8.desc": "",
    "member-meal.step8.image": "",
    "member-meal.step9.title": "",
    "member-meal.step9.desc": "",
    "member-meal.step9.image": "",
    "member-meal.step10.title": "",
    "member-meal.step10.desc": "",
    "member-meal.step10.image": "",

    // ========================================
    // 📄 member-nutrition (영양 리포트) - DefaultPage
    // ========================================
    "member-nutrition.title": "영양 리포트",
    "member-nutrition.intro":
      "회원별 영양 섭취 현황을 분석한 주간/월간 리포트를 생성하고 관리할 수 있습니다.",
    "member-nutrition.guide-title": "영양 리포트 가이드",
    "member-nutrition.step1.title": "리포트 조회",
    "member-nutrition.step1.desc":
      "'회원 관리' > '영양 리포트'에서 회원별 영양 분석 리포트를 확인할 수 있습니다.",
    "member-nutrition.step1.image":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    "member-nutrition.step2.title": "주간/월간 리포트 생성",
    "member-nutrition.step2.desc":
      "기간을 선택하고 '리포트 생성' 버튼을 클릭하면 자동으로 영양 분석 리포트가 생성됩니다.",
    "member-nutrition.step2.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "member-nutrition.step3.title": "리포트 다운로드 및 공유",
    "member-nutrition.step3.desc":
      "생성된 리포트를 PDF로 다운로드하거나 이메일로 회원에게 직접 발송할 수 있습니다.",
    "member-nutrition.step3.image":
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=400&fit=crop",
    "member-nutrition.step4.title": "",
    "member-nutrition.step4.desc": "",
    "member-nutrition.step4.image": "",
    "member-nutrition.step5.title": "",
    "member-nutrition.step5.desc": "",
    "member-nutrition.step5.image": "",
    "member-nutrition.step6.title": "",
    "member-nutrition.step6.desc": "",
    "member-nutrition.step6.image": "",
    "member-nutrition.step7.title": "",
    "member-nutrition.step7.desc": "",
    "member-nutrition.step7.image": "",
    "member-nutrition.step8.title": "",
    "member-nutrition.step8.desc": "",
    "member-nutrition.step8.image": "",
    "member-nutrition.step9.title": "",
    "member-nutrition.step9.desc": "",
    "member-nutrition.step9.image": "",
    "member-nutrition.step10.title": "",
    "member-nutrition.step10.desc": "",
    "member-nutrition.step10.image": "",

    // ========================================
    // 📄 member-consult (온라인 상담) - DefaultPage
    // ========================================
    "member-consult.title": "온라인 상담",
    "member-consult.intro":
      "회원과의 영양 상담 내용을 기록하고 관리할 수 있습니다. 상담 히스토리를 체계적으로 관리하여 맞춤형 서비스를 제공하세요.",
    "member-consult.guide-title": "온라인 상담 가이드",
    "member-consult.step1.title": "상담 요청 확인",
    "member-consult.step1.desc":
      "'회원 관리' > '온라인 상담'에서 회원의 상담 요청을 확인할 수 있습니다.",
    "member-consult.step1.image":
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=400&fit=crop",
    "member-consult.step2.title": "상담 내용 작성",
    "member-consult.step2.desc":
      "회원과의 상담 ��용, 조언, 목표 설정 등을 상세하게 기록합니다.",
    "member-consult.step2.image":
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    "member-consult.step3.title": "상담 히스토리 조회",
    "member-consult.step3.desc":
      "회원별 과거 상담 내용을 시간순으로 조회하여 지속적인 관리를 제공���니다.",
    "member-consult.step3.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "member-consult.step4.title": "상담 완료 처리",
    "member-consult.step4.desc":
      "상담이 완료되면 '완료' 버튼을 클릭하여 회원에게 상담 완료 알림을 발송합니다.",
    "member-consult.step4.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "member-consult.step5.title": "",
    "member-consult.step5.desc": "",
    "member-consult.step5.image": "",
    "member-consult.step6.title": "",
    "member-consult.step6.desc": "",
    "member-consult.step6.image": "",
    "member-consult.step7.title": "",
    "member-consult.step7.desc": "",
    "member-consult.step7.image": "",
    "member-consult.step8.title": "",
    "member-consult.step8.desc": "",
    "member-consult.step8.image": "",
    "member-consult.step9.title": "",
    "member-consult.step9.desc": "",
    "member-consult.step9.image": "",
    "member-consult.step10.title": "",
    "member-consult.step10.desc": "",
    "member-consult.step10.image": "",

    // ========================================
    // 📄 recipe-create (레시피 생성) - DefaultPage
    // ========================================
    "recipe-create.title": "레시피 생성",
    "recipe-create.intro":
      "기관의 특성에 맞는 맞춤형 레시피를 생성하고 회원에게 제공할 수 있습니다. 영양 정보가 자동으로 계산됩니다.",
    "recipe-create.guide-title": "레시피 생성 가이드",
    "recipe-create.step1.title": "레시피 기본 정보 입력",
    "recipe-create.step1.desc":
      "'레시피 관리' > '레시피 생성'에서 레시피 이름, 카테고리, 조리 시간 등 기본 정보를 입력합니다.",
    "recipe-create.step1.image":
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=400&fit=crop",
    "recipe-create.step2.title": "재료 입력",
    "recipe-create.step2.desc":
      "레시피에 사용되는 재료와 중량을 입력하면 영양소가 자동으로 계산됩니다.",
    "recipe-create.step2.image":
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop",
    "recipe-create.step3.title": "조리 방법 작성",
    "recipe-create.step3.desc":
      "단계별로 조리 방법을 작성하고, 각 단계마다 사진을 추가할 수 있습니다.",
    "recipe-create.step3.image":
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=400&fit=crop",
    "recipe-create.step4.title": "영양 정보 확인",
    "recipe-create.step4.desc":
      "입력한 재료를 바탕으로 자동 계산된 칼로리, 탄수화물, 단백질, 지방 정보를 확인합니다.",
    "recipe-create.step4.image":
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop",
    "recipe-create.step5.title": "레시피 사진 업로드",
    "recipe-create.step5.desc":
      "완성된 요리의 사진을 업로드하여 레시피를 더욱 매력적으로 만듭니다.",
    "recipe-create.step5.image":
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop",
    "recipe-create.step6.title": "레시피 저장 및 공개",
    "recipe-create.step6.desc":
      "모든 정보를 입력한 후 '저장' 버튼을 클릭하면 레시피가 생성되며, 회원에게 공개할 수 있습니다.",
    "recipe-create.step6.image":
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=400&fit=crop",
    "recipe-create.step7.title": "",
    "recipe-create.step7.desc": "",
    "recipe-create.step7.image": "",
    "recipe-create.step8.title": "",
    "recipe-create.step8.desc": "",
    "recipe-create.step8.image": "",
    "recipe-create.step9.title": "",
    "recipe-create.step9.desc": "",
    "recipe-create.step9.image": "",
    "recipe-create.step10.title": "",
    "recipe-create.step10.desc": "",
    "recipe-create.step10.image": "",

    // ========================================
    // 📄 recipe-manage (레시피 관리) - DefaultPage
    // ========================================
    "recipe-manage.title": "레시피 관리",
    "recipe-manage.intro":
      "등록된 레시피를 조회, 수정, 삭제하고 회원에게 추천할 수 있습니다.",
    "recipe-manage.guide-title": "레시피 관리 가이드",
    "recipe-manage.step1.title": "레시피 목록 조회",
    "recipe-manage.step1.desc":
      "'레시피 관리' > '레시피 관리'에서 등록된 전체 레시피 목록을 확인할 수 있습니다.",
    "recipe-manage.step1.image":
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=400&fit=crop",
    "recipe-manage.step2.title": "레시피 검색 및 필터",
    "recipe-manage.step2.desc":
      "카테고리, 칼로리 범위, 조리 시간 등으로 레시피를 필터링하여 빠르게 찾을 수 있습니다.",
    "recipe-manage.step2.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "recipe-manage.step3.title": "레시피 수정",
    "recipe-manage.step3.desc":
      "레시피를 클릭하여 상세 페이지로 이동한 후 '수정' 버튼을 클릭하여 내용을 변경할 수 있습니다.",
    "recipe-manage.step3.image":
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop",
    "recipe-manage.step4.title": "레시피 회원 추천",
    "recipe-manage.step4.desc":
      "특정 레시피를 선택하여 회원 또는 회��� 그룹에게 푸시 알림으로 추천할 수 있습니다.",
    "recipe-manage.step4.image":
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    "recipe-manage.step5.title": "",
    "recipe-manage.step5.desc": "",
    "recipe-manage.step5.image": "",
    "recipe-manage.step6.title": "",
    "recipe-manage.step6.desc": "",
    "recipe-manage.step6.image": "",
    "recipe-manage.step7.title": "",
    "recipe-manage.step7.desc": "",
    "recipe-manage.step7.image": "",
    "recipe-manage.step8.title": "",
    "recipe-manage.step8.desc": "",
    "recipe-manage.step8.image": "",
    "recipe-manage.step9.title": "",
    "recipe-manage.step9.desc": "",
    "recipe-manage.step9.image": "",
    "recipe-manage.step10.title": "",
    "recipe-manage.step10.desc": "",
    "recipe-manage.step10.image": "",

    // ========================================
    // 📄 settings-institution (기관 설정) - DefaultPage
    // ========================================
    "settings-institution.title": "기관 설정",
    "settings-institution.intro":
      "기관의 기본 정보, 운영 정책, 앱 연동 설정 등을 관리할 수 있습니다.",
    "settings-institution.guide-title": "기관 설정 가이드",
    "settings-institution.step1.title": "기관 기본 정보 입력",
    "settings-institution.step1.desc":
      "'설정' > '기관 설정'에서 기관명, 주소, 전화번호, 대표 이메일 등 기본 정보를 입력하고 수정할 수 있습니다.",
    "settings-institution.step1.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "settings-institution.step2.title": "운영 시간 설정",
    "settings-institution.step2.desc":
      "기관의 운영 시간과 휴무일을 설정하여 회원에게 안내할 수 있습니다.",
    "settings-institution.step2.image":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    "settings-institution.step3.title": "앱 연동 설정",
    "settings-institution.step3.desc":
      "상식플러스 앱과의 연동을 활성화하고 기관 코드를 발급받습니다.",
    "settings-institution.step3.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "settings-institution.step4.title": "알림 설정",
    "settings-institution.step4.desc":
      "회원에게 발송되는 푸시, 이메일, SMS 알림의 기본 설정을 관리합니다.",
    "settings-institution.step4.image":
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop",
    "settings-institution.step5.title": "",
    "settings-institution.step5.desc": "",
    "settings-institution.step5.image": "",
    "settings-institution.step6.title": "",
    "settings-institution.step6.desc": "",
    "settings-institution.step6.image": "",
    "settings-institution.step7.title": "",
    "settings-institution.step7.desc": "",
    "settings-institution.step7.image": "",
    "settings-institution.step8.title": "",
    "settings-institution.step8.desc": "",
    "settings-institution.step8.image": "",
    "settings-institution.step9.title": "",
    "settings-institution.step9.desc": "",
    "settings-institution.step9.image": "",
    "settings-institution.step10.title": "",
    "settings-institution.step10.desc": "",
    "settings-institution.step10.image": "",

    // ========================================
    // 📄 settings-members (기관 구성원 관리) - DefaultPage
    // ========================================
    "settings-members.title": "기관 구성원 관리",
    "settings-members.intro":
      "기관의 관리자와 구성원을 초대하고 역할을 부여할 수 있습니다.",
    "settings-members.guide-title": "구성원 관리 가이드",
    "settings-members.step1.title": "구성원 목록 조회",
    "settings-members.step1.desc":
      "'설정' > '기관 구성원 관리'에서 현재 등록된 관리자와 구���원 목록을 확인할 수 있습니다.",
    "settings-members.step1.image":
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=400&fit=crop",
    "settings-members.step2.title": "구성원 초대",
    "settings-members.step2.desc":
      "'구성원 초대' 버튼을 클릭하고 초대할 구성원의 이메일 주소와 역할(관리자/일반)을 입력합니다.",
    "settings-members.step2.image":
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    "settings-members.step3.title": "초대 메일 발송",
    "settings-members.step3.desc":
      "초대 메일이 발송되면 구성원은 이메일의 링크를 클릭하여 간단하게 가입할 수 있습니다.",
    "settings-members.step3.image":
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop",
    "settings-members.step4.title": "역할 변경 및 관리",
    "settings-members.step4.desc":
      "구성원 목록에서 역할을 변경하거나 계정을 비활성화할 수 있습니다.",
    "settings-members.step4.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "settings-members.step5.title": "권한 설정",
    "settings-members.step5.desc":
      "각 구성원의 메뉴별 접근 권한을 세부적으�� 설정할 수 있습니다.",
    "settings-members.step5.image":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    "settings-members.step6.title": "",
    "settings-members.step6.desc": "",
    "settings-members.step6.image": "",
    "settings-members.step7.title": "",
    "settings-members.step7.desc": "",
    "settings-members.step7.image": "",
    "settings-members.step8.title": "",
    "settings-members.step8.desc": "",
    "settings-members.step8.image": "",
    "settings-members.step9.title": "",
    "settings-members.step9.desc": "",
    "settings-members.step9.image": "",
    "settings-members.step10.title": "",
    "settings-members.step10.desc": "",
    "settings-members.step10.image": "",

    // ========================================
    // 📄 settings-etc (기타 설정) - DefaultPage
    // ========================================
    "settings-etc.title": "기타 설정",
    "settings-etc.intro":
      "시스템 언어, 알림 설정, 데이터 백업 등 기타 설정을 ���리할 수 있습니다.",
    "settings-etc.guide-title": "기타 설정 가이드",
    "settings-etc.step1.title": "언어 설정",
    "settings-etc.step1.desc":
      "'설정' > '기타 설정'에서 시스템 언어를 한국어 또는 영어로 변경할 수 있습니다.",
    "settings-etc.step1.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "settings-etc.step2.title": "알림 환경설정",
    "settings-etc.step2.desc":
      "시스템 알림, 이메일 알림, SMS 알림의 수신 여부를 개별적으로 설정할 수 있습니다.",
    "settings-etc.step2.image":
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop",
    "settings-etc.step3.title": "데이터 백업",
    "settings-etc.step3.desc":
      "회원 데이터, 식단 기록 등을 정기적으로 백업하여 안전하게 보관할 수 있습니다.",
    "settings-etc.step3.image":
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=400&fit=crop",
    "settings-etc.step4.title": "",
    "settings-etc.step4.desc": "",
    "settings-etc.step4.image": "",
    "settings-etc.step5.title": "",
    "settings-etc.step5.desc": "",
    "settings-etc.step5.image": "",
    "settings-etc.step6.title": "",
    "settings-etc.step6.desc": "",
    "settings-etc.step6.image": "",
    "settings-etc.step7.title": "",
    "settings-etc.step7.desc": "",
    "settings-etc.step7.image": "",
    "settings-etc.step8.title": "",
    "settings-etc.step8.desc": "",
    "settings-etc.step8.image": "",
    "settings-etc.step9.title": "",
    "settings-etc.step9.desc": "",
    "settings-etc.step9.image": "",
    "settings-etc.step10.title": "",
    "settings-etc.step10.desc": "",
    "settings-etc.step10.image": "",

    // ========================================
    // 📄 notice-list (공지사항) - NoticeListPage
    // ========================================
    "notice-list.title": "서비스 공지사항",
    "notice-list.intro":
      "DMS 서비스 업데이트, 이용약관 변경, 점검 안내 등 중요한 공지사항을 확인하세요.",
    "notice-list.badge.important": "중요",
    "notice-list.badge.new": "최신",
    "notice-list.empty": "등록된 공지사항이 없습니다.",
    "notice-list.tip-title": "공지사항 알림 설정",
    "notice-list.tip-desc":
      "중요한 공지사항은 이메일과 앱 푸시 알림으로 발송됩니다. 알림 설정은 'DMS 설정 > 기타 설정'에서 변경할 수 있습니다.",

    // 공지사항 1
    "notice-list.notice1.title": "DMS 서비스 이용약관 변경 안내 (2025년 1월)",
    "notice-list.notice1.date": "2025년 1월 15일",
    "notice-list.notice1.content":
      "<strong>■ 변경 내용</strong><br/><br/>" +
      "1. 개인정보 처리방침 업데이트<br/>" +
      "   - 회원 식단 사진의 보관 기간 명시 (최대 3년)<br/>" +
      "   - 기관 탈퇴 시 데이터 삭제 절차 추가<br/><br/>" +
      "2. 서비스 이용 요금 정책 변경<br/>" +
      "   - 무료 체험 기간: 14일 → 30일로 연장<br/>" +
      "   - 유료 전환 시 할인 혜택 제공<br/><br/>" +
      "3. 기관 관리자 책임 사항 추가<br/>" +
      "   - 구성원 권한 관리 및 정기 점검 의무화<br/><br/>" +
      "<strong>■ 적용 일자</strong><br/>" +
      "2025년 2월 1일부터 적용됩니다.<br/><br/>" +
      "<strong>■ 문의</strong><br/>" +
      "변경 사항에 대해 궁금하신 점은 고객센터(support@doinglab.com)로 문의 주시기 바랍니다.",

    // 공지사항 2
    "notice-list.notice2.title": "DMS 백오피스 V2.5 업데이트 안내",
    "notice-list.notice2.date": "2025년 1월 10일",
    "notice-list.notice2.content":
      "<strong>■ 주요 업데이트 내용</strong><br/><br/>" +
      "1. 영양 리포트 고도화<br/>" +
      "   - 주간/월간 영양 섭취 추이 그래프 추가<br/>" +
      "   - 영양소별 권장 섭취량 대비 비교 기능<br/><br/>" +
      "2. 회원 관리 기능 개선<br/>" +
      "   - 회원 검색 속도 50% 향상<br/>" +
      "   - 회원 태그 기능 추가 (당뇨, 고혈압 등)<br/><br/>" +
      "3. 모바일 반응형 최적화<br/>" +
      "   - 태블릿 환경에서의 UI/UX 개선<br/><br/>" +
      "4. 버그 수정<br/>" +
      "   - 식단 기록 저장 오류 수정<br/>" +
      "   - 엑셀 다운로드 시 한글 깨짐 현상 해결<br/><br/>" +
      "<strong>■ 업데이트 일정</strong><br/>" +
      "2025년 1월 12일 (일) 오전 2시 ~ 5시 (약 3시간 소요)<br/>" +
      "※ 업데이트 중에는 서비스 이용이 일시 중단됩니다.",

    // 공지사항 3
    "notice-list.notice3.title": "정기 점검 안내 (2024년 12월)",
    "notice-list.notice3.date": "2024년 12월 20일",
    "notice-list.notice3.content":
      "<strong>■ 점검 일시</strong><br/>" +
      "2024년 12월 24일 (화) 오전 1시 ~ 4시 (약 3시간)<br/><br/>" +
      "<strong>■ 점검 사유</strong><br/>" +
      "- 서버 인프라 업그레이드<br/>" +
      "- 데이터베이스 최적화<br/>" +
      "- 보안 패치 적용<br/><br/>" +
      "<strong>■ 서비스 영향</strong><br/>" +
      "점검 시간 동안 DMS 백오피스 및 상식플러스 앱 서비스가 일시 중단됩니다.<br/>" +
      "※ 점검 완료 후 정상 이용 가능합니다.",

    // 공지사항 4
    "notice-list.notice4.title": "상식플러스 앱 업데이트 (v3.2.0)",
    "notice-list.notice4.date": "2024년 12월 5일",
    "notice-list.notice4.content":
      "<strong>■ 앱 업데이트 내용</strong><br/><br/>" +
      "1. 식단 기록 UI 개선<br/>" +
      "   - 사진 촬영 화면 개선<br/>" +
      "   - AI 음식 인식 정확도 향상<br/><br/>" +
      "2. 알림 기능 추가<br/>" +
      "   - 식사 시간 알림 설정<br/>" +
      "   - 영양사 피드백 알림<br/><br/>" +
      "3. 성능 최적화<br/>" +
      "   - 앱 실행 속도 개선<br/>" +
      "   - 배터리 소모 최소화<br/><br/>" +
      "<strong>■ 업데이트 방법</strong><br/>" +
      "App Store / Google Play에서 '상식플러스' 검색 후 업데이트를 진행해 주세요.",

    // 공지사항 5
    "notice-list.notice5.title": "DMS 고객센터 운영 시간 변경 안내",
    "notice-list.notice5.date": "2024년 11월 25일",
    "notice-list.notice5.content":
      "<strong>■ 변경 내용</strong><br/><br/>" +
      "<strong>변경 전:</strong><br/>" +
      "평일 09:00 ~ 18:00 (주말 및 공휴일 휴무)<br/><br/>" +
      "<strong>변경 후:</strong><br/>" +
      "평일 10:00 ~ 19:00 (주말 및 공휴일 휴무)<br/>" +
      "점심시간: 12:00 ~ 13:00 (상담 불가)<br/><br/>" +
      "<strong>■ 적용 일자</strong><br/>" +
      "2024년 12월 1일부터 적용됩니다.<br/><br/>" +
      "<strong>■ 연락처</strong><br/>" +
      "이메일: support@doinglab.com<br/>" +
      "전화: 1588-XXXX",

    // ========================================
    // 📄 default (기본 페이지 - 사용하지 않음)
    // ========================================
    "default.title": "문서 섹션",
    "default.intro":
      "이 섹션은 현재 개발 중입니다. 자세한 문서 및 지침을 보려면 사이드바 탐색에서 다른 주제를 선택하십시오.",
    "default.guide-title": "매뉴얼 활용 가이드",
    "default.step1.title": "메뉴 탐색",
    "default.step1.desc":
      "왼쪽 사이드바에서 원하는 카테고리와 항목을 선택하여 관련 매뉴얼을 확인할 수 있습니다.",
    "default.step1.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "default.step2.title": "검색 기능 사용",
    "default.step2.desc":
      "상단 검색창에 키워드를 입력하여 필요한 정보를 빠르게 찾을 수 있습니다.",
    "default.step2.image":
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
    "default.step3.title": "단계별 따라하기",
    "default.step3.desc":
      "각 매뉴얼은 번호가 매겨진 단계로 구성되어 있어 순서대로 따라하면 쉽게 작업을 완료할 수 있습니다.",
    "default.step3.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "default.step4.title": "",
    "default.step4.desc": "",
    "default.step4.image": "",
    "default.step5.title": "",
    "default.step5.desc": "",
    "default.step5.image": "",
    "default.step6.title": "",
    "default.step6.desc": "",
    "default.step6.image": "",
    "default.step7.title": "",
    "default.step7.desc": "",
    "default.step7.image": "",
    "default.step8.title": "",
    "default.step8.desc": "",
    "default.step8.image": "",
    "default.step9.title": "",
    "default.step9.desc": "",
    "default.step9.image": "",
    "default.step10.title": "",
    "default.step10.desc": "",
    "default.step10.image": "",
  },

  // ========================================
  // 🇬🇧 영어 (English)
  // ========================================
  en: {
    // ========================================
    // 🔹 공통 (Common)
    // ========================================
    "admin.title": "DMS",
    "admin.manual": "DMS User Guide",

    // ========================================
    // 🔹 카테고리 (Categories)
    // ========================================
    "category.start": "Getting Started with DMS",
    "category.login": "DMS Login/Sign Up",
    "category.app": "App - SangsikPlus Connection",
    "category.member": "DMS Member Management",
    "category.recipe": "Institution Recipe Management",
    "category.settings": "DMS Settings",
    "category.notice": "Service Notices",

    // ========================================
    // 🔹 사이드바 메뉴 (Sidebar Sections)
    // ========================================
    // Getting Started with DMS
    "section.start.features": "Getting Started with DMS",
    
    // DMS Login/Sign Up
    "section.login.admin": "Institution Admin Registration",
    "section.login.member": "Member Invitation & Registration",

    // App - SangsikPlus Connection
    "section.app.intro": "App - SangsikPlus Introduction",
    "section.app.connection": "DMS-SangsikPlus(App) Connection",

    // DMS Member Management
    "section.member.dashboard": "Dashboard",
    "section.member.info": "Member Information Management",
    "section.member.meal": "Meal Record Management",
    "section.member.nutrition": "Nutrition Report",
    "section.member.consult": "Online Consultation",

    // Institution Recipe Management
    "section.recipe.create": "Recipe Creation",
    "section.recipe.manage": "Recipe Management",

    // DMS Settings
    "section.settings.institution": "Institution Settings",
    "section.settings.members": "Institution Member Management",
    "section.settings.etc": "Other Settings",
    
    // Notice
    "section.notice.list": "Notice List",

    // ========================================
    // 📄 start-features (Getting Started with DMS) - StartFeaturesPage
    // ========================================
    "start-features.title": "Getting Started with DMS",
    "start-features.intro":
      "Explore DMS features by category and navigate directly to the manual you need.",
    
    // 🆕 Feature Cards (Editable in Admin)
    "start-features.feature1.title": "Getting Started with DMS",
    "start-features.feature1.desc":
      "Learn how to log in and sign up to start using DMS.",
    "start-features.feature1.icon": "🚀",
    
    "start-features.feature2.title": "App - SangsikPlus Connection",
    "start-features.feature2.desc":
      "Mobile app introduction and how to connect with DMS.",
    "start-features.feature2.icon": "📱",
    
    "start-features.feature3.title": "DMS Member Management",
    "start-features.feature3.desc":
      "Manage member information, meal records, nutrition reports, and online consultation.",
    "start-features.feature3.icon": "👥",
    
    "start-features.feature4.title": "Institution Recipe Management",
    "start-features.feature4.desc":
      "Create customized recipes for your institution and provide them to members.",
    "start-features.feature4.icon": "🍽️",
    
    "start-features.feature5.title": "DMS Settings",
    "start-features.feature5.desc":
      "Configure institution information, manage members, and other settings.",
    "start-features.feature5.icon": "⚙️",
    
    "start-features.tip-title": "Manual Usage Guide",
    "start-features.tip-desc":
      "Click on a category above to navigate directly to that section. Use the left sidebar to select detailed manuals.",

    // ========================================
    // 📄 start-login (DMS Login/Sign Up) - DefaultPage
    // ========================================
    "start-login.title": "DMS Login/Sign Up",
    "start-login.intro":
      "Guide on how to access the DMS back office for the first time or manage your account. Check the sign-up process for institution administrators and members.",
    "start-login.guide-title": "Login/Sign Up Guide",
    "start-login.step1.title": "Apply for Free Trial",
    "start-login.step1.desc":
      "Click the 'Free Trial' button on the DMS homepage or click the 'Sign Up' button on the back office login page.",
    "start-login.step1.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "start-login.step2.title": "Enter Basic Information",
    "start-login.step2.desc":
      "Enter institution name, contact person name, email address, and password. The email address is used as the login ID.",
    "start-login.step2.image":
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=400&fit=crop",
    "start-login.step3.title": "Email Verification",
    "start-login.step3.desc":
      "Check the verification email sent to your email address and click the 'Verify Email' button to complete verification.",
    "start-login.step3.image":
      "https://images.unsplash.com/photo-1579275542618-a1dfed5f54ba?w=800&h=400&fit=crop",
    "start-login.step4.title": "Login and Start",
    "start-login.step4.desc":
      "Once email verification is complete, go to the login page and log in with the email and password you entered during sign-up.",
    "start-login.step4.image":
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
    "start-login.step5.title": "",
    "start-login.step5.desc": "",
    "start-login.step5.image": "",
    "start-login.step6.title": "",
    "start-login.step6.desc": "",
    "start-login.step6.image": "",
    "start-login.step7.title": "",
    "start-login.step7.desc": "",
    "start-login.step7.image": "",
    "start-login.step8.title": "",
    "start-login.step8.desc": "",
    "start-login.step8.image": "",
    "start-login.step9.title": "",
    "start-login.step9.desc": "",
    "start-login.step9.image": "",
    "start-login.step10.title": "",
    "start-login.step10.desc": "",
    "start-login.step10.image": "",

    // ========================================
    // 📄 join-dms (Institution Admin Registration) - DefaultPage
    // ========================================
    "join-dms.title": "Institution Admin Registration",
    "join-dms.intro":
      "Guide on how to sign up as an institution admin in DMS. The admin has the highest authority to manage all institution settings and invite members.",
    "join-dms.guide-title": "Institution Admin Registration Process",
    "join-dms.step1.title": "Access Free Trial Page",
    "join-dms.step1.desc":
      "Visit the DMS homepage (https://admin.dms.doinglab.com) and click the 'Free Trial' or 'Sign Up' button.",
    "join-dms.step1.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "join-dms.step2.title": "Enter Institution Information",
    "join-dms.step2.desc":
      "Enter institution name, business registration number (optional), institution address, and other basic information.",
    "join-dms.step2.image":
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop",
    "join-dms.step3.title": "Enter Admin Information",
    "join-dms.step3.desc":
      "Enter name, email address, password, and contact information. The email address will be used as the login ID.",
    "join-dms.step3.image":
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=400&fit=crop",
    "join-dms.step4.title": "Email Verification",
    "join-dms.step4.desc":
      "Check the verification email sent to your email address and click the 'Verify Email' button to complete verification.",
    "join-dms.step4.image":
      "https://images.unsplash.com/photo-1579275542618-a1dfed5f54ba?w=800&h=400&fit=crop",
    "join-dms.step5.title": "Login and Configure Institution",
    "join-dms.step5.desc":
      "After email verification, log in and proceed with detailed institution settings (nutrition standards, notification settings, etc.).",
    "join-dms.step5.image":
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
    "join-dms.step6.title": "",
    "join-dms.step6.desc": "",
    "join-dms.step6.image": "",
    "join-dms.step7.title": "",
    "join-dms.step7.desc": "",
    "join-dms.step7.image": "",
    "join-dms.step8.title": "",
    "join-dms.step8.desc": "",
    "join-dms.step8.image": "",
    "join-dms.step9.title": "",
    "join-dms.step9.desc": "",
    "join-dms.step9.image": "",
    "join-dms.step10.title": "",
    "join-dms.step10.desc": "",
    "join-dms.step10.image": "",

    // ========================================
    // 📄 login-member (Member Invitation & Registration) - DefaultPage
    // ========================================
    "login-member.title": "Member Invitation & Registration",
    "login-member.intro":
      "Guide on how to invite institution members (nutritionists, counselors, etc.) and how invited members sign up for DMS.",
    "login-member.guide-title": "Member Invitation & Registration Process",
    "login-member.step1.title": "Admin: Invite Member",
    "login-member.step1.desc":
      "The admin navigates to 'DMS Settings > Institution Member Management', clicks 'Invite Member', and enters the invitee's email address and permission level.",
    "login-member.step1.image":
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    "login-member.step2.title": "Member: Check Invitation Email",
    "login-member.step2.desc":
      "The invited member checks the invitation email and clicks the 'Accept Invitation' or 'Sign Up' button.",
    "login-member.step2.image":
      "https://images.unsplash.com/photo-1579275542618-a1dfed5f54ba?w=800&h=400&fit=crop",
    "login-member.step3.title": "Enter Member Information",
    "login-member.step3.desc":
      "Enter name, password, contact information, etc. to complete the sign-up. The email address is automatically filled from the invitation.",
    "login-member.step3.image":
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=400&fit=crop",
    "login-member.step4.title": "Login and Start Working",
    "login-member.step4.desc":
      "After sign-up, log in and start working on tasks such as member management and consultation records according to the assigned permissions.",
    "login-member.step4.image":
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
    "login-member.step5.title": "",
    "login-member.step5.desc": "",
    "login-member.step5.image": "",
    "login-member.step6.title": "",
    "login-member.step6.desc": "",
    "login-member.step6.image": "",
    "login-member.step7.title": "",
    "login-member.step7.desc": "",
    "login-member.step7.image": "",
    "login-member.step8.title": "",
    "login-member.step8.desc": "",
    "login-member.step8.image": "",
    "login-member.step9.title": "",
    "login-member.step9.desc": "",
    "login-member.step9.image": "",
    "login-member.step10.title": "",
    "login-member.step10.desc": "",
    "login-member.step10.image": "",

    // ========================================
    // 📄 app-intro (App - SangsikPlus Introduction) - DefaultPage
    // ========================================
    "app-intro.title": "App - SangsikPlus Introduction",
    "app-intro.intro":
      "SangsikPlus is a mobile app where members can record their diet directly and check nutrition information. It synchronizes data in real-time with DMS.",
    "app-intro.guide-title": "SangsikPlus App Key Features",
    "app-intro.step1.title": "Take Photos and Record Meals",
    "app-intro.step1.desc":
      "Members can easily record their meals by taking photos, and AI automatically recognizes the food.",
    "app-intro.step1.image":
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop",
    "app-intro.step2.title": "Check Nutrition Analysis",
    "app-intro.step2.desc":
      "Check calories, carbohydrates, protein, fat, and other nutrients of recorded meals in real-time.",
    "app-intro.step2.image":
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop",
    "app-intro.step3.title": "Communicate with Consultants",
    "app-intro.step3.desc":
      "Receive feedback from nutrition consultants and communicate via 1:1 chat.",
    "app-intro.step3.image":
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    "app-intro.step4.title": "",
    "app-intro.step4.desc": "",
    "app-intro.step4.image": "",
    "app-intro.step5.title": "",
    "app-intro.step5.desc": "",
    "app-intro.step5.image": "",
    "app-intro.step6.title": "",
    "app-intro.step6.desc": "",
    "app-intro.step6.image": "",
    "app-intro.step7.title": "",
    "app-intro.step7.desc": "",
    "app-intro.step7.image": "",
    "app-intro.step8.title": "",
    "app-intro.step8.desc": "",
    "app-intro.step8.image": "",
    "app-intro.step9.title": "",
    "app-intro.step9.desc": "",
    "app-intro.step9.image": "",
    "app-intro.step10.title": "",
    "app-intro.step10.desc": "",
    "app-intro.step10.image": "",

    // ========================================
    // 📄 app-connection (DMS-SangsikPlus Connection) - DefaultPage
    // ========================================
    "app-connection.title": "DMS-SangsikPlus(App) Connection",
    "app-connection.header-image": "LANG_SPECIFIC_IMAGE", // Managed in PageImages.tsx
    "app-connection.intro":
      "Guide on how to link DMS back office with SangsikPlus app to synchronize member data in real-time.",
    "app-connection.guide-title": "App Connection Guide",
    "app-connection.step1.title": "Access Institution Settings Menu",
    "app-connection.step1.desc":
      "Select 'Settings' > 'Institution Settings' from the left menu in the DMS back office.",
    "app-connection.step1.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "app-connection.step2.title": "Activate App Connection",
    "app-connection.step2.desc":
      "Find the 'App Connection' section on the institution settings page and click the 'Activate Connection' button.",
    "app-connection.step2.image":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    "app-connection.step3.title": "Check Institution Code",
    "app-connection.step3.desc":
      "Check and copy the unique institution code generated after activation. This code is used by members to find the institution in the app.",
    "app-connection.step3.image":
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
    "app-connection.step4.title": "Deliver Institution Code to Members",
    "app-connection.step4.desc":
      "Deliver the copied institution code to members via text message, email, etc., and guide them to enter it in the app.",
    "app-connection.step4.image":
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop",
    "app-connection.step5.title": "Check Connection Status",
    "app-connection.step5.desc":
      "Once members enter the institution code in the app and connect, you can check the number of connected members in real-time on the DMS dashboard.",
    "app-connection.step5.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "app-connection.step6.title": "",
    "app-connection.step6.desc": "",
    "app-connection.step6.image": "",
    "app-connection.step7.title": "",
    "app-connection.step7.desc": "",
    "app-connection.step7.image": "",
    "app-connection.step8.title": "",
    "app-connection.step8.desc": "",
    "app-connection.step8.image": "",
    "app-connection.step9.title": "",
    "app-connection.step9.desc": "",
    "app-connection.step9.image": "",
    "app-connection.step10.title": "",
    "app-connection.step10.desc": "",
    "app-connection.step10.image": "",

    // ========================================
    // 📄 member-dashboard (Dashboard) - DefaultPage
    // ========================================
    "member-dashboard.title": "Member Management Dashboard",
    "member-dashboard.intro":
      "Dashboard where you can check key indicators such as overall member status, diet records, and nutrition analysis at a glance.",
    "member-dashboard.guide-title": "Dashboard Usage Guide",
    "member-dashboard.step1.title": "Access Dashboard",
    "member-dashboard.step1.desc":
      "Select 'Member Management' > 'Dashboard' from the left menu to go to the main dashboard screen.",
    "member-dashboard.step1.image":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    "member-dashboard.step2.title": "Check Key Indicators",
    "member-dashboard.step2.desc":
      "Check total member count, today's diet records, average nutrition score, etc. at a glance through key indicator cards at the top of the screen.",
    "member-dashboard.step2.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "member-dashboard.step3.title": "Set Filters and Period",
    "member-dashboard.step3.desc":
      "Set filters such as date, member group, and activity status to selectively view and analyze desired data.",
    "member-dashboard.step3.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "member-dashboard.step4.title": "",
    "member-dashboard.step4.desc": "",
    "member-dashboard.step4.image": "",
    "member-dashboard.step5.title": "",
    "member-dashboard.step5.desc": "",
    "member-dashboard.step5.image": "",
    "member-dashboard.step6.title": "",
    "member-dashboard.step6.desc": "",
    "member-dashboard.step6.image": "",
    "member-dashboard.step7.title": "",
    "member-dashboard.step7.desc": "",
    "member-dashboard.step7.image": "",
    "member-dashboard.step8.title": "",
    "member-dashboard.step8.desc": "",
    "member-dashboard.step8.image": "",
    "member-dashboard.step9.title": "",
    "member-dashboard.step9.desc": "",
    "member-dashboard.step9.image": "",
    "member-dashboard.step10.title": "",
    "member-dashboard.step10.desc": "",
    "member-dashboard.step10.image": "",

    // ========================================
    // 📄 member-info (Member Information Management) - DefaultPage
    // ========================================
    "member-info.title": "Member Information Management",
    "member-info.intro":
      "View and edit basic information and health information of members registered in the institution.",
    "member-info.guide-title": "Member Information Management Guide",
    "member-info.step1.title": "View Member List",
    "member-info.step1.desc":
      "Check the list of all registered members in 'Member Management' > 'Member Information Management' menu.",
    "member-info.step1.image":
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=400&fit=crop",
    "member-info.step2.title": "Search for Members",
    "member-info.step2.desc":
      "Quickly find members by searching with name, email, phone number, etc.",
    "member-info.step2.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "member-info.step3.title": "View Member Details",
    "member-info.step3.desc":
      "Click on a member's name to view detailed information including basic info, health info, and diet record history.",
    "member-info.step3.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "member-info.step4.title": "Edit Member Information",
    "member-info.step4.desc":
      "Click the 'Edit' button on the member detail page to update basic and health information.",
    "member-info.step4.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "member-info.step5.title": "",
    "member-info.step5.desc": "",
    "member-info.step5.image": "",
    "member-info.step6.title": "",
    "member-info.step6.desc": "",
    "member-info.step6.image": "",
    "member-info.step7.title": "",
    "member-info.step7.desc": "",
    "member-info.step7.image": "",
    "member-info.step8.title": "",
    "member-info.step8.desc": "",
    "member-info.step8.image": "",
    "member-info.step9.title": "",
    "member-info.step9.desc": "",
    "member-info.step9.image": "",
    "member-info.step10.title": "",
    "member-info.step10.desc": "",
    "member-info.step10.image": "",

    // ========================================
    // 📄 member-meal (Meal Record Management) - DefaultPage
    // ========================================
    "member-meal.title": "Meal Record Management",
    "member-meal.intro":
      "Check members' breakfast, lunch, dinner, and snack records with photos and provide feedback.",
    "member-meal.guide-title": "Meal Record Management Guide",
    "member-meal.step1.title": "View Meal Records",
    "member-meal.step1.desc":
      "View meal records by member and date in 'Member Management' > 'Meal Record Management'.",
    "member-meal.step1.image":
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop",
    "member-meal.step2.title": "Check Meal Photos",
    "member-meal.step2.desc":
      "Click on meal photos uploaded by members to view them in detail and check AI-analyzed food information.",
    "member-meal.step2.image":
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop",
    "member-meal.step3.title": "Automatic Nutrition Analysis",
    "member-meal.step3.desc":
      "Check AI-analyzed calories, carbohydrates, protein, and fat information and edit if necessary.",
    "member-meal.step3.image":
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop",
    "member-meal.step4.title": "Write Feedback",
    "member-meal.step4.desc":
      "Write feedback on meal records and it will be sent to members via push notification.",
    "member-meal.step4.image":
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    "member-meal.step5.title": "Export Records",
    "member-meal.step5.desc":
      "Export meal records for a specific period to Excel or PDF format.",
    "member-meal.step5.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "member-meal.step6.title": "",
    "member-meal.step6.desc": "",
    "member-meal.step6.image": "",
    "member-meal.step7.title": "",
    "member-meal.step7.desc": "",
    "member-meal.step7.image": "",
    "member-meal.step8.title": "",
    "member-meal.step8.desc": "",
    "member-meal.step8.image": "",
    "member-meal.step9.title": "",
    "member-meal.step9.desc": "",
    "member-meal.step9.image": "",
    "member-meal.step10.title": "",
    "member-meal.step10.desc": "",
    "member-meal.step10.image": "",

    // ========================================
    // 📄 member-nutrition (Nutrition Report) - DefaultPage
    // ========================================
    "member-nutrition.title": "Nutrition Report",
    "member-nutrition.intro":
      "Generate and manage weekly/monthly reports analyzing nutrition intake status for each member.",
    "member-nutrition.guide-title": "Nutrition Report Guide",
    "member-nutrition.step1.title": "View Reports",
    "member-nutrition.step1.desc":
      "Check nutrition analysis reports for each member in 'Member Management' > 'Nutrition Report'.",
    "member-nutrition.step1.image":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    "member-nutrition.step2.title": "Generate Weekly/Monthly Report",
    "member-nutrition.step2.desc":
      "Select a period and click the 'Generate Report' button to automatically create a nutrition analysis report.",
    "member-nutrition.step2.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "member-nutrition.step3.title": "Download and Share Report",
    "member-nutrition.step3.desc":
      "Download the generated report as PDF or send it directly to members via email.",
    "member-nutrition.step3.image":
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=400&fit=crop",
    "member-nutrition.step4.title": "",
    "member-nutrition.step4.desc": "",
    "member-nutrition.step4.image": "",
    "member-nutrition.step5.title": "",
    "member-nutrition.step5.desc": "",
    "member-nutrition.step5.image": "",
    "member-nutrition.step6.title": "",
    "member-nutrition.step6.desc": "",
    "member-nutrition.step6.image": "",
    "member-nutrition.step7.title": "",
    "member-nutrition.step7.desc": "",
    "member-nutrition.step7.image": "",
    "member-nutrition.step8.title": "",
    "member-nutrition.step8.desc": "",
    "member-nutrition.step8.image": "",
    "member-nutrition.step9.title": "",
    "member-nutrition.step9.desc": "",
    "member-nutrition.step9.image": "",
    "member-nutrition.step10.title": "",
    "member-nutrition.step10.desc": "",
    "member-nutrition.step10.image": "",

    // ========================================
    // 📄 member-consult (Online Consultation) - DefaultPage
    // ========================================
    "member-consult.title": "Online Consultation",
    "member-consult.intro":
      "Record and manage nutrition consultation content with members. Manage consultation history systematically to provide customized services.",
    "member-consult.guide-title": "Online Consultation Guide",
    "member-consult.step1.title": "Check Consultation Requests",
    "member-consult.step1.desc":
      "Check member consultation requests in 'Member Management' > 'Online Consultation'.",
    "member-consult.step1.image":
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=400&fit=crop",
    "member-consult.step2.title": "Write Consultation Content",
    "member-consult.step2.desc":
      "Record consultation content with members, advice, goal setting, etc. in detail.",
    "member-consult.step2.image":
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    "member-consult.step3.title": "View Consultation History",
    "member-consult.step3.desc":
      "View past consultation content for each member in chronological order to provide continuous management.",
    "member-consult.step3.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "member-consult.step4.title": "Complete Consultation",
    "member-consult.step4.desc":
      "Click the 'Complete' button when consultation is finished to send a consultation completion notification to the member.",
    "member-consult.step4.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "member-consult.step5.title": "",
    "member-consult.step5.desc": "",
    "member-consult.step5.image": "",
    "member-consult.step6.title": "",
    "member-consult.step6.desc": "",
    "member-consult.step6.image": "",
    "member-consult.step7.title": "",
    "member-consult.step7.desc": "",
    "member-consult.step7.image": "",
    "member-consult.step8.title": "",
    "member-consult.step8.desc": "",
    "member-consult.step8.image": "",
    "member-consult.step9.title": "",
    "member-consult.step9.desc": "",
    "member-consult.step9.image": "",
    "member-consult.step10.title": "",
    "member-consult.step10.desc": "",
    "member-consult.step10.image": "",

    // ========================================
    // 📄 recipe-create (Recipe Creation) - DefaultPage
    // ========================================
    "recipe-create.title": "Recipe Creation",
    "recipe-create.intro":
      "Create customized recipes suited to institution characteristics and provide them to members. Nutrition information is calculated automatically.",
    "recipe-create.guide-title": "Recipe Creation Guide",
    "recipe-create.step1.title": "Enter Recipe Basic Information",
    "recipe-create.step1.desc":
      "Enter basic information such as recipe name, category, cooking time, etc. in 'Recipe Management' > 'Recipe Creation'.",
    "recipe-create.step1.image":
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=400&fit=crop",
    "recipe-create.step2.title": "Enter Ingredients",
    "recipe-create.step2.desc":
      "Enter ingredients and weights used in the recipe, and nutrients are calculated automatically.",
    "recipe-create.step2.image":
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop",
    "recipe-create.step3.title": "Write Cooking Method",
    "recipe-create.step3.desc":
      "Write cooking method step by step and add photos to each step.",
    "recipe-create.step3.image":
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=400&fit=crop",
    "recipe-create.step4.title": "Check Nutrition Information",
    "recipe-create.step4.desc":
      "Check automatically calculated calories, carbohydrates, protein, and fat information based on entered ingredients.",
    "recipe-create.step4.image":
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop",
    "recipe-create.step5.title": "Upload Recipe Photo",
    "recipe-create.step5.desc":
      "Upload photos of finished dishes to make recipes more attractive.",
    "recipe-create.step5.image":
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop",
    "recipe-create.step6.title": "Save and Publish Recipe",
    "recipe-create.step6.desc":
      "After entering all information, click the 'Save' button to create the recipe and publish it to members.",
    "recipe-create.step6.image":
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=400&fit=crop",
    "recipe-create.step7.title": "",
    "recipe-create.step7.desc": "",
    "recipe-create.step7.image": "",
    "recipe-create.step8.title": "",
    "recipe-create.step8.desc": "",
    "recipe-create.step8.image": "",
    "recipe-create.step9.title": "",
    "recipe-create.step9.desc": "",
    "recipe-create.step9.image": "",
    "recipe-create.step10.title": "",
    "recipe-create.step10.desc": "",
    "recipe-create.step10.image": "",

    // ========================================
    // 📄 recipe-manage (Recipe Management) - DefaultPage
    // ========================================
    "recipe-manage.title": "Recipe Management",
    "recipe-manage.intro":
      "View, edit, delete registered recipes and recommend them to members.",
    "recipe-manage.guide-title": "Recipe Management Guide",
    "recipe-manage.step1.title": "View Recipe List",
    "recipe-manage.step1.desc":
      "Check the list of all registered recipes in 'Recipe Management' > 'Recipe Management'.",
    "recipe-manage.step1.image":
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=400&fit=crop",
    "recipe-manage.step2.title": "Search and Filter Recipes",
    "recipe-manage.step2.desc":
      "Filter recipes by category, calorie range, cooking time, etc. to quickly find them.",
    "recipe-manage.step2.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "recipe-manage.step3.title": "Edit Recipe",
    "recipe-manage.step3.desc":
      "Click on a recipe to go to the detail page and click the 'Edit' button to modify content.",
    "recipe-manage.step3.image":
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop",
    "recipe-manage.step4.title": "Recommend Recipe to Members",
    "recipe-manage.step4.desc":
      "Select a specific recipe and recommend it to members or member groups via push notification.",
    "recipe-manage.step4.image":
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    "recipe-manage.step5.title": "",
    "recipe-manage.step5.desc": "",
    "recipe-manage.step5.image": "",
    "recipe-manage.step6.title": "",
    "recipe-manage.step6.desc": "",
    "recipe-manage.step6.image": "",
    "recipe-manage.step7.title": "",
    "recipe-manage.step7.desc": "",
    "recipe-manage.step7.image": "",
    "recipe-manage.step8.title": "",
    "recipe-manage.step8.desc": "",
    "recipe-manage.step8.image": "",
    "recipe-manage.step9.title": "",
    "recipe-manage.step9.desc": "",
    "recipe-manage.step9.image": "",
    "recipe-manage.step10.title": "",
    "recipe-manage.step10.desc": "",
    "recipe-manage.step10.image": "",

    // ========================================
    // 📄 settings-institution (Institution Settings) - DefaultPage
    // ========================================
    "settings-institution.title": "Institution Settings",
    "settings-institution.intro":
      "Manage institution's basic information, operation policies, app connection settings, etc.",
    "settings-institution.guide-title": "Institution Settings Guide",
    "settings-institution.step1.title": "Enter Institution Basic Information",
    "settings-institution.step1.desc":
      "Enter and edit basic information such as institution name, address, phone number, representative email in 'Settings' > 'Institution Settings'.",
    "settings-institution.step1.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "settings-institution.step2.title": "Set Operating Hours",
    "settings-institution.step2.desc":
      "Set institution's operating hours and holidays to inform members.",
    "settings-institution.step2.image":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    "settings-institution.step3.title": "App Connection Settings",
    "settings-institution.step3.desc":
      "Activate connection with SangsikPlus app and receive institution code.",
    "settings-institution.step3.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "settings-institution.step4.title": "Notification Settings",
    "settings-institution.step4.desc":
      "Manage default settings for push, email, and SMS notifications sent to members.",
    "settings-institution.step4.image":
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop",
    "settings-institution.step5.title": "",
    "settings-institution.step5.desc": "",
    "settings-institution.step5.image": "",
    "settings-institution.step6.title": "",
    "settings-institution.step6.desc": "",
    "settings-institution.step6.image": "",
    "settings-institution.step7.title": "",
    "settings-institution.step7.desc": "",
    "settings-institution.step7.image": "",
    "settings-institution.step8.title": "",
    "settings-institution.step8.desc": "",
    "settings-institution.step8.image": "",
    "settings-institution.step9.title": "",
    "settings-institution.step9.desc": "",
    "settings-institution.step9.image": "",
    "settings-institution.step10.title": "",
    "settings-institution.step10.desc": "",
    "settings-institution.step10.image": "",

    // ========================================
    // 📄 settings-members (Institution Member Management) - DefaultPage
    // ========================================
    "settings-members.title": "Institution Member Management",
    "settings-members.intro":
      "Invite administrators and members of the institution and assign roles.",
    "settings-members.guide-title": "Member Management Guide",
    "settings-members.step1.title": "View Member List",
    "settings-members.step1.desc":
      "Check the list of currently registered administrators and members in 'Settings' > 'Institution Member Management'.",
    "settings-members.step1.image":
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=400&fit=crop",
    "settings-members.step2.title": "Invite Members",
    "settings-members.step2.desc":
      "Click the 'Invite Member' button and enter the email address and role (administrator/general) of the member to invite.",
    "settings-members.step2.image":
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    "settings-members.step3.title": "Send Invitation Email",
    "settings-members.step3.desc":
      "Once the invitation email is sent, members can easily sign up by clicking the link in the email.",
    "settings-members.step3.image":
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop",
    "settings-members.step4.title": "Change Roles and Manage",
    "settings-members.step4.desc":
      "Change roles or deactivate accounts in the member list.",
    "settings-members.step4.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "settings-members.step5.title": "Set Permissions",
    "settings-members.step5.desc":
      "Set detailed access permissions for each member by menu.",
    "settings-members.step5.image":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    "settings-members.step6.title": "",
    "settings-members.step6.desc": "",
    "settings-members.step6.image": "",
    "settings-members.step7.title": "",
    "settings-members.step7.desc": "",
    "settings-members.step7.image": "",
    "settings-members.step8.title": "",
    "settings-members.step8.desc": "",
    "settings-members.step8.image": "",
    "settings-members.step9.title": "",
    "settings-members.step9.desc": "",
    "settings-members.step9.image": "",
    "settings-members.step10.title": "",
    "settings-members.step10.desc": "",
    "settings-members.step10.image": "",

    // ========================================
    // 📄 settings-etc (Other Settings) - DefaultPage
    // ========================================
    "settings-etc.title": "Other Settings",
    "settings-etc.intro":
      "Manage other settings such as system language, notification settings, data backup, etc.",
    "settings-etc.guide-title": "Other Settings Guide",
    "settings-etc.step1.title": "Language Settings",
    "settings-etc.step1.desc":
      "Change system language to Korean or English in 'Settings' > 'Other Settings'.",
    "settings-etc.step1.image":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    "settings-etc.step2.title": "Notification Preferences",
    "settings-etc.step2.desc":
      "Set whether to receive system notifications, email notifications, and SMS notifications individually.",
    "settings-etc.step2.image":
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=400&fit=crop",
    "settings-etc.step3.title": "Data Backup",
    "settings-etc.step3.desc":
      "Regularly backup member data, diet records, etc. to keep them safe.",
    "settings-etc.step3.image":
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=400&fit=crop",
    "settings-etc.step4.title": "",
    "settings-etc.step4.desc": "",
    "settings-etc.step4.image": "",
    "settings-etc.step5.title": "",
    "settings-etc.step5.desc": "",
    "settings-etc.step5.image": "",
    "settings-etc.step6.title": "",
    "settings-etc.step6.desc": "",
    "settings-etc.step6.image": "",
    "settings-etc.step7.title": "",
    "settings-etc.step7.desc": "",
    "settings-etc.step7.image": "",
    "settings-etc.step8.title": "",
    "settings-etc.step8.desc": "",
    "settings-etc.step8.image": "",
    "settings-etc.step9.title": "",
    "settings-etc.step9.desc": "",
    "settings-etc.step9.image": "",
    "settings-etc.step10.title": "",
    "settings-etc.step10.desc": "",
    "settings-etc.step10.image": "",

    // ========================================
    // 📄 notice-list (Notice) - NoticeListPage
    // ========================================
    "notice-list.title": "Service Notices",
    "notice-list.intro":
      "Check important notices about DMS service updates, terms of service changes, maintenance schedules, and more.",
    "notice-list.badge.important": "Important",
    "notice-list.badge.new": "New",
    "notice-list.empty": "No notices available.",
    "notice-list.tip-title": "Notice Notification Settings",
    "notice-list.tip-desc":
      "Important notices are sent via email and app push notifications. You can change notification settings in 'DMS Settings > Other Settings'.",

    // Notice 1
    "notice-list.notice1.title": "DMS Terms of Service Update Notice (January 2025)",
    "notice-list.notice1.date": "January 15, 2025",
    "notice-list.notice1.content":
      "<strong>■ Changes</strong><br/><br/>" +
      "1. Privacy Policy Update<br/>" +
      "   - Member meal photo retention period specified (maximum 3 years)<br/>" +
      "   - Data deletion procedure added upon institution withdrawal<br/><br/>" +
      "2. Service Fee Policy Changes<br/>" +
      "   - Free trial period: Extended from 14 days to 30 days<br/>" +
      "   - Discount benefits when converting to paid plan<br/><br/>" +
      "3. Institution Admin Responsibilities Added<br/>" +
      "   - Member permission management and regular inspection mandatory<br/><br/>" +
      "<strong>■ Effective Date</strong><br/>" +
      "Applies from February 1, 2025.<br/><br/>" +
      "<strong>■ Contact</strong><br/>" +
      "For questions about the changes, please contact customer service (support@doinglab.com).",

    // Notice 2
    "notice-list.notice2.title": "DMS Back Office V2.5 Update Notice",
    "notice-list.notice2.date": "January 10, 2025",
    "notice-list.notice2.content":
      "<strong>■ Major Updates</strong><br/><br/>" +
      "1. Advanced Nutrition Reports<br/>" +
      "   - Weekly/monthly nutrition intake trend graphs added<br/>" +
      "   - Nutrient-specific comparison with recommended intake<br/><br/>" +
      "2. Member Management Improvements<br/>" +
      "   - Member search speed improved by 50%<br/>" +
      "   - Member tag feature added (diabetes, hypertension, etc.)<br/><br/>" +
      "3. Mobile Responsive Optimization<br/>" +
      "   - UI/UX improvements in tablet environment<br/><br/>" +
      "4. Bug Fixes<br/>" +
      "   - Meal record save error fixed<br/>" +
      "   - Excel download Korean character encoding issue resolved<br/><br/>" +
      "<strong>■ Update Schedule</strong><br/>" +
      "January 12, 2025 (Sun) 2:00 AM ~ 5:00 AM (approx. 3 hours)<br/>" +
      "※ Service will be temporarily unavailable during the update.",

    // Notice 3
    "notice-list.notice3.title": "Regular Maintenance Notice (December 2024)",
    "notice-list.notice3.date": "December 20, 2024",
    "notice-list.notice3.content":
      "<strong>■ Maintenance Schedule</strong><br/>" +
      "December 24, 2024 (Tue) 1:00 AM ~ 4:00 AM (approx. 3 hours)<br/><br/>" +
      "<strong>■ Maintenance Reason</strong><br/>" +
      "- Server infrastructure upgrade<br/>" +
      "- Database optimization<br/>" +
      "- Security patch application<br/><br/>" +
      "<strong>■ Service Impact</strong><br/>" +
      "DMS back office and SangsikPlus app services will be temporarily suspended during maintenance.<br/>" +
      "※ Service will be available normally after maintenance is complete.",

    // Notice 4
    "notice-list.notice4.title": "SangsikPlus App Update (v3.2.0)",
    "notice-list.notice4.date": "December 5, 2024",
    "notice-list.notice4.content":
      "<strong>■ App Update Contents</strong><br/><br/>" +
      "1. Meal Record UI Improvements<br/>" +
      "   - Photo capture screen improved<br/>" +
      "   - AI food recognition accuracy enhanced<br/><br/>" +
      "2. Notification Feature Added<br/>" +
      "   - Meal time notification settings<br/>" +
      "   - Nutritionist feedback notification<br/><br/>" +
      "3. Performance Optimization<br/>" +
      "   - App launch speed improved<br/>" +
      "   - Battery consumption minimized<br/><br/>" +
      "<strong>■ Update Method</strong><br/>" +
      "Search for 'SangsikPlus' in App Store / Google Play and proceed with the update.",

    // Notice 5
    "notice-list.notice5.title": "DMS Customer Service Hours Change Notice",
    "notice-list.notice5.date": "November 25, 2024",
    "notice-list.notice5.content":
      "<strong>■ Changes</strong><br/><br/>" +
      "<strong>Before:</strong><br/>" +
      "Weekdays 09:00 ~ 18:00 (Closed on weekends and holidays)<br/><br/>" +
      "<strong>After:</strong><br/>" +
      "Weekdays 10:00 ~ 19:00 (Closed on weekends and holidays)<br/>" +
      "Lunch break: 12:00 ~ 13:00 (Consultation unavailable)<br/><br/>" +
      "<strong>■ Effective Date</strong><br/>" +
      "Applies from December 1, 2024.<br/><br/>" +
      "<strong>■ Contact</strong><br/>" +
      "Email: support@doinglab.com<br/>" +
      "Phone: 1588-XXXX",

    // ========================================
    // 📄 default (Default Page - Not Used)
    // ========================================
    "default.title": "Document Section",
    "default.intro":
      "This section is currently under development. Please select another topic from the sidebar navigation to view detailed documentation and guidelines.",
    "default.guide-title": "Manual Usage Guide",
    "default.step1.title": "Navigate Menu",
    "default.step1.desc":
      "Select the desired category and item from the left sidebar to check related manuals.",
    "default.step1.image":
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "default.step2.title": "Use Search Function",
    "default.step2.desc":
      "Enter keywords in the search bar at the top to quickly find the information you need.",
    "default.step2.image":
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
    "default.step3.title": "Follow Step by Step",
    "default.step3.desc":
      "Each manual is organized in numbered steps, making it easy to complete tasks by following in order.",
    "default.step3.image":
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "default.step4.title": "",
    "default.step4.desc": "",
    "default.step4.image": "",
    "default.step5.title": "",
    "default.step5.desc": "",
    "default.step5.image": "",
    "default.step6.title": "",
    "default.step6.desc": "",
    "default.step6.image": "",
    "default.step7.title": "",
    "default.step7.desc": "",
    "default.step7.image": "",
    "default.step8.title": "",
    "default.step8.desc": "",
    "default.step8.image": "",
    "default.step9.title": "",
    "default.step9.desc": "",
    "default.step9.image": "",
    "default.step10.title": "",
    "default.step10.desc": "",
    "default.step10.image": "",
  },
};

// ========================================
// 🔧 Language Context Provider
// ========================================

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("ko");
  const [updateTrigger, setUpdateTrigger] = useState(0);
  // const [pageMetadata, setPageMetadata] = useState<Record<string, PageMetadata>>(initialPageMetadata);
  const [isLoading, setIsLoading] = useState(true); // 🆕 로딩 상태
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // 🆕 삭제 대기 이미지 목록

  // 🐛 디버깅: 렌더링 추적
  console.log('[LanguageProvider] Rendering...', { 
    language, 
    updateTrigger, 
    isLoading,
    imagesToDeleteCount: imagesToDelete.length,
    timestamp: new Date().toISOString()
  });

  // 🆕 Supabase에서 데이터 로드하는 함수 (export용)
  const loadFromSupabase = async () => {
    try {
      console.log('[LanguageContext] Loading data from Supabase...');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8aea8ee5/manual/load`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[LanguageContext] Data loaded from Supabase:', data);
        
        // ✅ 저장된 데이터가 있으면 완전히 교체 (하드코딩된 더미 데이터 제거)
        if (data.translations) {
          // ✅ 1. 기존 하드코딩된 데이터 전부 삭제
          for (const key in translations.ko) {
            delete translations.ko[key];
          }
          for (const key in translations.en) {
            delete translations.en[key];
          }
          
          // ✅ 2. Supabase 데이터만 넣기
          if (data.translations.ko) {
            Object.assign(translations.ko, data.translations.ko);
          }
          if (data.translations.en) {
            Object.assign(translations.en, data.translations.en);
          }
          
          // 🆕 3. 필수 키 fallback (Supabase에 없으면 하드코딩 기본값 사용)
          const essentialKeys = {
            ko: {
              "notice-list.badge.important": "중요",
              "notice-list.badge.new": "최신",
            },
            en: {
              "notice-list.badge.important": "Important",
              "notice-list.badge.new": "New",
            }
          };
          
          // 한국어 필수 키 추가
          for (const [key, value] of Object.entries(essentialKeys.ko)) {
            if (!translations.ko[key]) {
              translations.ko[key] = value;
              console.log(`[LanguageContext] ✅ Added missing essential key (ko): ${key}`);
            }
          }
          
          // 영어 필수 키 추가
          for (const [key, value] of Object.entries(essentialKeys.en)) {
            if (!translations.en[key]) {
              translations.en[key] = value;
              console.log(`[LanguageContext] ✅ Added missing essential key (en): ${key}`);
            }
          }
          
          console.log('[LanguageContext] ✅ Translations replaced with Supabase data');
          console.log('[LanguageContext] KO keys:', Object.keys(translations.ko).length);
          console.log('[LanguageContext] EN keys:', Object.keys(translations.en).length);
        }
        
        if (data.commonVisibility) {
          // ✅ commonVisibility 완전 교체
          for (const key in commonVisibility) {
            delete commonVisibility[key];
          }
          Object.assign(commonVisibility, data.commonVisibility);
          console.log('[LanguageContext] ✅ Visibility replaced with Supabase data');
        }

        if (data.pageMetadata) {
          // ✅ pageMetadata 완전 교체
          for (const key in pageMetadata) {
            delete pageMetadata[key];
          }
          Object.assign(pageMetadata, data.pageMetadata);
          console.log('[LanguageContext] ✅ PageMetadata replaced with Supabase data');
        }
        
        // 🆕 menuStructure 처리
        if (data.menuStructure && Array.isArray(data.menuStructure)) {
          console.log('[LanguageContext] 🔄 Processing menuStructure...', {
            categoryCount: data.menuStructure.length,
            categories: data.menuStructure.map((cat: any) => cat.id)
          });
          
          // menuStructure에서 카테고리 순서 추출
          const categoryOrder = data.menuStructure.map((cat: any) => cat.id);
          translations.ko['__categoryOrder'] = JSON.stringify(categoryOrder);
          translations.en['__categoryOrder'] = JSON.stringify(categoryOrder);
          console.log('[LanguageContext] ✅ Category order saved:', categoryOrder);
          
          // 각 카테고리의 페이지 순서 저장
          data.menuStructure.forEach((category: any) => {
            if (category.pages && Array.isArray(category.pages)) {
              const orderKey = `__pageOrder.${category.id}`;
              translations.ko[orderKey] = JSON.stringify(category.pages);
              translations.en[orderKey] = JSON.stringify(category.pages);
              console.log(`[LanguageContext] ✅ Page order saved for ${category.id}:`, category.pages);
            }
          });
          
          console.log('[LanguageContext] ✅ MenuStructure processed successfully');
        } else {
          console.log('[LanguageContext] ⚠️ No menuStructure in loaded data - Auto-generating...');
          
          // 🆕 menuStructure가 없으면 translations에서 자동 생성
          const categoryKeys = Object.keys(translations.ko).filter(key => key.startsWith('category.'));
          const detectedCategories = categoryKeys.map(key => key.replace('category.', ''));
          console.log('[LanguageContext] 📋 Detected categories from translations:', detectedCategories);
          
          // 기본 순서 또는 저장된 __categoryOrder 사용
          let categoryOrder: string[];
          if (translations.ko['__categoryOrder']) {
            try {
              categoryOrder = JSON.parse(translations.ko['__categoryOrder']);
              console.log('[LanguageContext] ✅ Using saved category order:', categoryOrder);
            } catch (e) {
              categoryOrder = detectedCategories;
              console.log('[LanguageContext] ⚠️ Failed to parse category order, using detected:', categoryOrder);
            }
          } else {
            categoryOrder = detectedCategories;
            translations.ko['__categoryOrder'] = JSON.stringify(categoryOrder);
            translations.en['__categoryOrder'] = JSON.stringify(categoryOrder);
            console.log('[LanguageContext] ✅ Generated new category order:', categoryOrder);
          }
          
          // 각 카테고리별 페이지 순서 확인/생성
          categoryOrder.forEach(categoryId => {
            const orderKey = `__pageOrder.${categoryId}`;
            
            if (!translations.ko[orderKey]) {
              // section.{category}.{page} 형태의 키 찾기
              const sectionPrefix = `section.${categoryId}.`;
              const sectionKeys = Object.keys(translations.ko).filter(key => key.startsWith(sectionPrefix));
              const pageNames = sectionKeys.map(key => key.replace(sectionPrefix, ''));
              const pageIds = pageNames.map(pageName => `${categoryId}-${pageName}`);
              
              if (pageIds.length > 0) {
                translations.ko[orderKey] = JSON.stringify(pageIds);
                translations.en[orderKey] = JSON.stringify(pageIds);
                console.log(`[LanguageContext] ✅ Auto-generated page order for ${categoryId}:`, pageIds);
              }
            } else {
              console.log(`[LanguageContext] ✅ Using existing page order for ${categoryId}`);
            }
          });
          
          console.log('[LanguageContext] ✅ Auto-generation complete - Data will be saved on next save operation');
        }
        
        // 리렌더링 트리거
        setUpdateTrigger(prev => prev + 1);
        
        // ✅ 데이터 로드 완료 이벤트 발생
        window.dispatchEvent(new CustomEvent('translations-updated', { 
          detail: { 
            source: 'load', 
            timestamp: new Date().toISOString(),
            keys: Object.keys(data.translations?.ko || {}).length
          } 
        }));
        
        // 🆕 배지 키 디버깅
        console.log('[LanguageContext] 🔍 Badge translations check:');
        console.log('  notice-list.badge.important (ko):', data.translations?.ko?.['notice-list.badge.important']);
        console.log('  notice-list.badge.new (ko):', data.translations?.ko?.['notice-list.badge.new']);
        console.log('  notice-list.badge.important (en):', data.translations?.en?.['notice-list.badge.important']);
        console.log('  notice-list.badge.new (en):', data.translations?.en?.['notice-list.badge.new']);
    } catch (error) {
      console.error('[LanguageContext] Load error:', error);
      console.log('[LanguageContext] Using default hardcoded data due to load error');
      throw error; // 🆕 에러를 다시 던져서 호출자가 처리할 수 있도록
    }
  };

  // 🆕 초기 로드: Supabase에서 데이터 읽기
  useEffect(() => {
    const initialLoad = async () => {
      try {
        await loadFromSupabase();
      } catch (error) {
        // ❌ Supabase 로드 실패 시 기본 하드코딩 데이터 사용
        // 초기 데이터가 이미 translations, commonVisibility, pageMetadata에 있으므로
        // 별도 처리 불필요 (fallback은 자동)
      } finally {
        console.log('[LanguageContext] Loading complete, setting isLoading to false');
        setIsLoading(false);
      }
    };

    initialLoad();
  }, []); // 최초 1회만 실행

  // ✅ useMemo로 감싸서 updateTrigger, language 변경 시 새로운 함수 생성
  const t = useMemo(() => {
    return (key: string): string | boolean => {
      // ✅ visible 키와 배지 키는 commonVisibility에서 조회 (언어 무관)
      if (
        key.endsWith(".visible") || 
        key.endsWith(".image-visible") ||
        key.endsWith(".tip-visible") || // 🆕 tip-visible 추가
        key.endsWith(".header-image-enabled") || // 🆕 header-image-enabled 추가
        key.endsWith(".isImportant") ||
        key.endsWith(".isNew")
      ) {
        return commonVisibility[key] ?? false; // 🔧 기본값 false로 변경
      }

      // ✅ 일반 번역 키는 현재 언어에서 조회
      const result = translations[language][key] ?? key;
      
      // 🆕 배지 키 디버깅
      if (key.includes('badge')) {
        console.log(`[t] 🔍 Badge key: "${key}"`, {
          language,
          hasValue: !!translations[language][key],
          result: result,
          fullTranslations: Object.keys(translations[language]).filter(k => k.includes('badge'))
        });
      }
      
      return result;
    };
  }, [language, updateTrigger]);

  // 🆕 개별 번역 키 업데이트
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateTranslation = useCallback((key: string, value: any, lang?: Language) => {
    const targetLang = lang || language;
    
    console.log('[LanguageContext] Updating translation:', { key, value, targetLang });
    
    // 🆕 이미지 URL 변경 감지 (삭제 대기 목록에 추가)
    if (key.endsWith('.image') || key.endsWith('.header-image')) {
      const oldValue = translations[targetLang][key];
      
      // 기존 이미지가 Storage 이미지이고, 새 값이 비어있거나 다른 URL인 경우
      if (oldValue && 
          typeof oldValue === 'string' && 
          oldValue.includes('make-8aea8ee5-manual-images') &&
          oldValue !== value) {
        console.log('[LanguageContext] Image will be deleted on save:', oldValue);
        setImagesToDelete(prev => {
          // 중복 방지
          if (!prev.includes(oldValue)) {
            return [...prev, oldValue];
          }
          return prev;
        });
      }
    }
    
    // visible 키와 배지 키는 commonVisibility 업데이트
    if (
      key.endsWith(".visible") || 
      key.endsWith(".image-visible") ||
      key.endsWith(".isImportant") ||
      key.endsWith(".isNew")
    ) {
      commonVisibility[key] = value;
    } else {
      // 일반 번역 키는 translations 업데이트
      translations[targetLang][key] = value;
    }
    
    // 리렌더링 트리거
    setUpdateTrigger(prev => prev + 1);
    
    // 전역 이벤트 발생 (다른 컴포넌트에 알림)
    window.dispatchEvent(new CustomEvent('translations-updated', { 
      detail: { key, value, language: targetLang } 
    }));
  }, [language, imagesToDelete]);

  // 🆕 페이지 전체 데이터 업데이트
  const updatePageData = (originalPageId: string, data: any) => {
    console.log('[LanguageContext] Updating page data:', { originalPageId, data });
    
    // ✅ 실제 번역 키 가져오기 (pageId와 다를 수 있음)
    const pageId = getTranslationKey(originalPageId);
    console.log('[LanguageContext] Translation key:', pageId, '(original:', originalPageId, ')');
    
    // 🆕 디버깅: 헤더 이미지 관련 데이터 확인
    console.log('[LanguageContext] Header image data:', {
      headerImageEnabled: data.headerImageEnabled,
      headerImageInputMethod: data.headerImageInputMethod,
      headerImage: data.headerImage,
    });
    
    // 한국어 업데이트
    if (data.title?.ko) {
      translations.ko[`${pageId}.title`] = data.title.ko;
    }
    if (data.intro?.ko) {
      translations.ko[`${pageId}.intro`] = data.intro.ko;
    }
    if (data.guideTitle?.ko) {
      translations.ko[`${pageId}.guide-title`] = data.guideTitle.ko;
    }
    
    // 🆕 헤더 이미지 활성화 여부 저장 (commonVisibility)
    if (data.headerImageEnabled !== undefined) {
      commonVisibility[`${pageId}.header-image-enabled`] = data.headerImageEnabled;
      console.log('[LanguageContext] ✅ Saved header-image-enabled:', data.headerImageEnabled);
    }
    
    // 🆕 헤더 이미지 입력 방식 저장 (translations)
    if (data.headerImageInputMethod !== undefined) {
      translations.ko[`${pageId}.header-image-input-method`] = data.headerImageInputMethod;
      translations.en[`${pageId}.header-image-input-method`] = data.headerImageInputMethod;
      console.log('[LanguageContext] ✅ Saved header-image-input-method:', data.headerImageInputMethod);
    }
    
    if (data.headerImage !== undefined) {
      if (typeof data.headerImage === 'string') {
        // 🔄 Fallback: string 타입이면 양쪽 동일하게 저장
        translations.ko[`${pageId}.header-image`] = data.headerImage;
        translations.en[`${pageId}.header-image`] = data.headerImage;
        console.log('[LanguageContext] ✅ Saved header-image (string):', data.headerImage);
      } else if (typeof data.headerImage === 'object') {
        // ✅ 언어별 이미지 객체 (빈 문자열도 저장)
        if (data.headerImage.ko !== undefined) {
          translations.ko[`${pageId}.header-image`] = data.headerImage.ko;
          console.log('[LanguageContext] ✅ Saved header-image.ko:', data.headerImage.ko);
        }
        if (data.headerImage.en !== undefined) {
          translations.en[`${pageId}.header-image`] = data.headerImage.en;
          console.log('[LanguageContext] ✅ Saved header-image.en:', data.headerImage.en);
        }
      }
    }
    
    // 영어 업데이트
    if (data.title?.en) {
      translations.en[`${pageId}.title`] = data.title.en;
    }
    if (data.intro?.en) {
      translations.en[`${pageId}.intro`] = data.intro.en;
    }
    if (data.guideTitle?.en) {
      translations.en[`${pageId}.guide-title`] = data.guideTitle.en;
    }
    
    // Step 데이터 업데이트
    if (data.steps && Array.isArray(data.steps)) {
      data.steps.forEach((step: any) => {
        const stepNum = step.number;
        
        // 한국어
        if (step.title?.ko) {
          translations.ko[`${pageId}.step${stepNum}.title`] = step.title.ko;
        }
        if (step.desc?.ko) {
          translations.ko[`${pageId}.step${stepNum}.desc`] = step.desc.ko;
        }
        
        // 영어
        if (step.title?.en) {
          translations.en[`${pageId}.step${stepNum}.title`] = step.title.en;
        }
        if (step.desc?.en) {
          translations.en[`${pageId}.step${stepNum}.desc`] = step.desc.en;
        }
        
        // 이미지 (🆕 언어별로 분리)
        if (step.image !== undefined) {
          if (typeof step.image === 'string') {
            // 🔄 Fallback: string 타입이면 양쪽 동일하게 저장
            translations.ko[`${pageId}.step${stepNum}.image`] = step.image;
            translations.en[`${pageId}.step${stepNum}.image`] = step.image;
          } else if (typeof step.image === 'object') {
            // ✅ 언어별 이미지 객체
            if (step.image.ko !== undefined) {
              translations.ko[`${pageId}.step${stepNum}.image`] = step.image.ko;
            }
            if (step.image.en !== undefined) {
              translations.en[`${pageId}.step${stepNum}.image`] = step.image.en;
            }
          }
        }
        
        // Visibility (언어 공통)
        if (step.visible !== undefined) {
          commonVisibility[`${pageId}.step${stepNum}.visible`] = step.visible;
        }
        if (step.imageVisible !== undefined) {
          commonVisibility[`${pageId}.step${stepNum}.image-visible`] = step.imageVisible;
        }
      });
    }
    
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
        
        // 🆕 링크 (언어 공통)
        if (feature.link !== undefined) {
          translations.ko[`${pageId}.feature${featureNum}.link`] = feature.link;
          translations.en[`${pageId}.feature${featureNum}.link`] = feature.link;
        }
        
        // Visibility (언어 공통)
        if (feature.visible !== undefined) {
          commonVisibility[`${pageId}.feature${featureNum}.visible`] = feature.visible;
        }
      });
      
      console.log(`[LanguageContext] Updated ${data.featureCards.length} feature cards for ${pageId}`);
    }
    
    // 🆕 공지사항(Notices) 데이터 업데이트
    if (data.notices && Array.isArray(data.notices)) {
      data.notices.forEach((notice: any) => {
        const noticeNum = notice.number;
        
        // 한국어
        if (notice.title?.ko) {
          translations.ko[`${pageId}.notice${noticeNum}.title`] = notice.title.ko;
        }
        if (notice.date?.ko) {
          translations.ko[`${pageId}.notice${noticeNum}.date`] = notice.date.ko;
        }
        if (notice.content?.ko) {
          translations.ko[`${pageId}.notice${noticeNum}.content`] = notice.content.ko;
        }
        
        // 영어
        if (notice.title?.en) {
          translations.en[`${pageId}.notice${noticeNum}.title`] = notice.title.en;
        }
        if (notice.date?.en) {
          translations.en[`${pageId}.notice${noticeNum}.date`] = notice.date.en;
        }
        if (notice.content?.en) {
          translations.en[`${pageId}.notice${noticeNum}.content`] = notice.content.en;
        }
        
        // Visibility (언어 공통)
        if (notice.visible !== undefined) {
          commonVisibility[`${pageId}.notice${noticeNum}.visible`] = notice.visible;
        }
        
        // 배지 (언어 공통)
        if (notice.isImportant !== undefined) {
          commonVisibility[`${pageId}.notice${noticeNum}.isImportant`] = notice.isImportant;
        }
        if (notice.isNew !== undefined) {
          commonVisibility[`${pageId}.notice${noticeNum}.isNew`] = notice.isNew;
        }
      });
      
      console.log(`[LanguageContext] Updated ${data.notices.length} notices for ${pageId}`);
    }
    
    // 🆕 Tip 영역 데이터 업데이트
    if (data.tipTitle !== undefined) {
      if (data.tipTitle.ko !== undefined) {
        translations.ko[`${pageId}.tip-title`] = data.tipTitle.ko;
      }
      if (data.tipTitle.en !== undefined) {
        translations.en[`${pageId}.tip-title`] = data.tipTitle.en;
      }
    }
    
    if (data.tipDesc !== undefined) {
      if (data.tipDesc.ko !== undefined) {
        translations.ko[`${pageId}.tip-desc`] = data.tipDesc.ko;
      }
      if (data.tipDesc.en !== undefined) {
        translations.en[`${pageId}.tip-desc`] = data.tipDesc.en;
      }
    }
    
    if (data.tipVisible !== undefined) {
      commonVisibility[`${pageId}.tip-visible`] = data.tipVisible;
      console.log(`[LanguageContext] ✅ Updated tip-visible for ${pageId}:`, data.tipVisible);
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
        
        console.log(`[LanguageContext] Updated overview tab for ${pageId}`);
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
        
        console.log(`[LanguageContext] Updated ${tc.features.length} features tab cards for ${pageId}`);
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
        
        console.log(`[LanguageContext] Updated ${tc.guide.length} guide tab steps for ${pageId}`);
      }
    }
    
    // 리렌더링 트리거
    setUpdateTrigger(prev => prev + 1);
    
    // 전역 이벤트 발생
    window.dispatchEvent(new CustomEvent('page-data-updated', { 
      detail: { pageId, data } 
    }));
    
    // ✅ Supabase에 저장 (수동 저장으로 변경)
    // saveToSupabase();
    
    console.log('[LanguageContext] Page data updated successfully');
  };

  // 🆕 Supabase 저장 함수
  const saveToSupabase = useCallback(async () => {
    try {
      // 🆕 menuStructure 생성
      const categories = getAllCategories();
      const menuStructure = categories.map(categoryId => ({
        id: categoryId,
        pages: getPagesByCategory(categoryId)
      }));
      
      console.log('[LanguageContext] Saving to Supabase...', {
        translationsKoKeys: Object.keys(translations.ko).length,
        translationsEnKeys: Object.keys(translations.en).length,
        visibilityKeys: Object.keys(commonVisibility).length,
        metadataKeys: Object.keys(pageMetadata).length,
        menuCategories: menuStructure.length,
      });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8aea8ee5/manual/save`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            translations,
            commonVisibility,
            pageMetadata,
            menuStructure, // 🆕 menuStructure 포함
          }),
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log('[LanguageContext] ✅ Saved to Supabase successfully:', result);
        
        // 🆕 저장 성공 후 삭제 대기 이미지들을 Storage에서 삭제
        if (imagesToDelete.length > 0) {
          console.log(`[LanguageContext] Deleting ${imagesToDelete.length} images from Storage...`);
          
          // 이미지 삭제를 비동기로 실행 (에러 무시)
          imagesToDelete.forEach(async (imageUrl) => {
            try {
              const deleteResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-8aea8ee5/admin/delete-image`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`,
                  },
                  body: JSON.stringify({ imageUrl }),
                }
              );
              
              if (deleteResponse.ok) {
                console.log('[LanguageContext] Image deleted successfully:', imageUrl);
              } else {
                console.warn('[LanguageContext] Image delete failed:', imageUrl, await deleteResponse.text());
              }
            } catch (error) {
              console.warn('[LanguageContext] Image delete error (ignored):', error);
            }
          });
          
          // 삭제 대기 목록 초기화
          setImagesToDelete([]);
          console.log('[LanguageContext] ✅ All images deletion initiated');
        }
        
        // ✅ 저장 성공 후 이벤트 발생 (Front 페이지 리렌더링 트리거)
        window.dispatchEvent(new CustomEvent('translations-updated', { 
          detail: { 
            source: 'save', 
            timestamp: new Date().toISOString(),
            keys: Object.keys(translations.ko).length
          } 
        }));
        
        return true;
      } else {
        const errorText = await response.text();
        console.error('[LanguageContext] ❌ Save failed:', errorText);
        return false;
      }
    } catch (error) {
      console.error('[LanguageContext] ❌ Save error:', error);
      return false;
    }
  }, [translations, commonVisibility, pageMetadata, imagesToDelete]);

  // 🆕 페이지 레이아웃 가져오기
  const getPageLayout = (pageId: string): PageLayout => {
    return pageMetadata[pageId]?.layout || "default";
  };

  // 🆕 번역 키 가져오기 (pageId와 다를 수 있음)
  const getTranslationKey = (pageId: string): string => {
    return pageMetadata[pageId]?.translationKey || pageId;
  };

  // 🆕 페이지 레이아웃 설정 (신규 메뉴 생성 시만 사용)
  const setPageLayout = (pageId: string, layout: PageLayout) => {
    console.log('[LanguageContext] Setting page layout:', { pageId, layout });
    console.log('[LanguageContext] ⚠️ SETTING LAYOUT:', layout, 'for pageId:', pageId);
    
    // ✅ translationKey는 pageId와 동일하게 설정 (별도 매핑 불필요)
    pageMetadata[pageId] = {
      layout,
      translationKey: pageId, // ✅ pageId 그대로 사용
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 리렌더링 트리거
    setUpdateTrigger(prev => prev + 1);
    
    console.log('[LanguageContext] Page layout set successfully');
    console.log('[LanguageContext] ✅ pageMetadata now has:', pageMetadata[pageId]);
  };

  // 🆕 대메뉴 추가
  const addCategory = (id: string, nameKo: string, nameEn: string) => {
    console.log('[LanguageContext] Adding category:', { id, nameKo, nameEn });
    
    // 대메뉴명 번역 추가
    translations.ko[`category.${id}`] = nameKo;
    translations.en[`category.${id}`] = nameEn;
    
    // 리렌더링 트리거
    setUpdateTrigger(prev => prev + 1);
    
    // Supabase 저장 (수동 저장으로 변경)
    // saveToSupabase();
    
    console.log('[LanguageContext] Category added successfully');
  };

  // 🆕 대메뉴명 수정 (ID는 변경 불가, 이름만 수정)
  const updateCategory = (categoryId: string, nameKo: string, nameEn: string) => {
    console.log('[LanguageContext] Updating category:', { categoryId, nameKo, nameEn });
    
    // 대메뉴명 번역 업데이트
    translations.ko[`category.${categoryId}`] = nameKo;
    translations.en[`category.${categoryId}`] = nameEn;
    
    // 리렌더링 트리거
    setUpdateTrigger(prev => prev + 1);
    
    console.log('[LanguageContext] Category updated successfully');
  };

  // 🆕 소메뉴(페이지) 추가
  const addPage = (pageId: string, nameKo: string, nameEn: string, layout: PageLayout) => {
    console.log('[LanguageContext] Adding page:', { pageId, nameKo, nameEn, layout });
    console.log('[LanguageContext] ⚠️ LAYOUT VALUE:', layout, 'TYPE:', typeof layout);
    
    // 페이지 ID에서 카테고리 추출
    const categoryId = pageId.split('-')[0];
    const pageName = pageId.split('-').slice(1).join('-');
    
    // 섹션 번역 키 추가 (section.{category}.{pageName})
    translations.ko[`section.${categoryId}.${pageName}`] = nameKo;
    translations.en[`section.${categoryId}.${pageName}`] = nameEn;
    
    // 페이지 제목 번역 추가
    translations.ko[`${pageId}.title`] = nameKo;
    translations.en[`${pageId}.title`] = nameEn;
    
    // 기본 소개 텍스트 추가
    translations.ko[`${pageId}.intro`] = `${nameKo} 페이지입니다. 백오피스에서 내용을 편집할 수 있습니다.`;
    translations.en[`${pageId}.intro`] = `This is the ${nameEn} page. You can edit the content in the admin panel.`;
    
    // 레이아웃에 따라 기본 필드 추가
    if (layout === "default") {
      translations.ko[`${pageId}.guide-title`] = "사용 가이드";
      translations.en[`${pageId}.guide-title`] = "User Guide";
      
      // 기본 Step 1개 추가
      translations.ko[`${pageId}.step1.title`] = "첫 번째 단계";
      translations.ko[`${pageId}.step1.desc`] = "첫 번째 단계 설명입니다.";
      translations.ko[`${pageId}.step1.image`] = "";
      translations.en[`${pageId}.step1.title`] = "First Step";
      translations.en[`${pageId}.step1.desc`] = "Description for the first step.";
      translations.en[`${pageId}.step1.image`] = "";
      commonVisibility[`${pageId}.step1.visible`] = true;
      commonVisibility[`${pageId}.step1.image-visible`] = false;
      
      // ✅ Tip 영역 기본값 추가 (default 레이아웃)
      translations.ko[`${pageId}.tip-title`] = "도움말";
      translations.ko[`${pageId}.tip-desc`] = "추가 정보나 유의사항을 입력하세요.";
      translations.en[`${pageId}.tip-title`] = "Tip";
      translations.en[`${pageId}.tip-desc`] = "Enter additional information or notes.";
      commonVisibility[`${pageId}.tip-visible`] = false; // 기본값: 숨김
    } else if (layout === "features") {
      // Feature 카드 1개 추가
      translations.ko[`${pageId}.feature1.title`] = "기능 1";
      translations.ko[`${pageId}.feature1.desc`] = "기능 1 설명입니다.";
      translations.ko[`${pageId}.feature1.icon`] = "📌";
      translations.en[`${pageId}.feature1.title`] = "Feature 1";
      translations.en[`${pageId}.feature1.desc`] = "Description for feature 1.";
      translations.en[`${pageId}.feature1.icon`] = "📌";
      commonVisibility[`${pageId}.feature1.visible`] = true;
      
      // ✅ Tip 영역 기본값 추가 (features 레이아웃)
      translations.ko[`${pageId}.tip-title`] = "안내사항";
      translations.ko[`${pageId}.tip-desc`] = "좌측 사이드바에서 원하는 메뉴를 선택하세요.";
      translations.en[`${pageId}.tip-title`] = "Notice";
      translations.en[`${pageId}.tip-desc`] = "Select the desired menu from the left sidebar.";
      commonVisibility[`${pageId}.tip-visible`] = true; // 기본값: 표시
    } else if (layout === "accordion") {
      // ✅ Accordion 레이아웃 템플릿 추가
      // 배지 번역
      translations.ko[`${pageId}.badge.important`] = "중요";
      translations.ko[`${pageId}.badge.new`] = "최신";
      translations.en[`${pageId}.badge.important`] = "Noti";
      translations.en[`${pageId}.badge.new`] = "New";
      
      // 빈 공지사항 메시지
      translations.ko[`${pageId}.empty`] = "등록된 공지사항이 없습니다.";
      translations.en[`${pageId}.empty`] = "No announcements available.";
      
      // 하단 팁 박스
      translations.ko[`${pageId}.tip-title`] = "공지사항 안내";
      translations.ko[`${pageId}.tip-desc`] = "중요한 서비스 공지와 업데이트 소식을 확인하세요.";
      translations.en[`${pageId}.tip-title`] = "Notice Information";
      translations.en[`${pageId}.tip-desc`] = "Check important service announcements and updates.";
      commonVisibility[`${pageId}.tip-visible`] = true; // ✅ 기본값: 표시
      
      // 기본 공지사항 1개 추가 (샘플)
      translations.ko[`${pageId}.notice1.title`] = "첫 번째 공지사항";
      translations.ko[`${pageId}.notice1.date`] = new Date().toISOString().split('T')[0];
      translations.ko[`${pageId}.notice1.content`] = "공지사항 내용을 입력하세요.";
      translations.en[`${pageId}.notice1.title`] = "First Announcement";
      translations.en[`${pageId}.notice1.date`] = new Date().toISOString().split('T')[0];
      translations.en[`${pageId}.notice1.content`] = "Enter the announcement content.";
      
      // 공지사항 visibility 및 배지 설정
      commonVisibility[`${pageId}.notice1.visible`] = true;
      commonVisibility[`${pageId}.notice1.isImportant`] = false;
      commonVisibility[`${pageId}.notice1.isNew`] = false;
    }
    
    // 페이지 레이아웃 메타데이터 설정
    setPageLayout(pageId, layout);
    
    // 리렌더링 트리거
    setUpdateTrigger(prev => prev + 1);
    
    // Supabase 저장 (수동 저장으로 변경)
    // saveToSupabase();
    
    console.log('[LanguageContext] Page added successfully');
  };

  // 🆕 전체 카테고리 목록 가져오기 (번역 키 기반)
  const getAllCategories = (): string[] => {
    const categoryKeys = Object.keys(translations.ko).filter(key => key.startsWith('category.'));
    const categories = categoryKeys.map(key => key.replace('category.', ''));
    
    // 저장된 순서가 있으면 사용
    const savedOrder = translations.ko['__categoryOrder'];
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        // 저장된 순서에 있는 카테고리 + 새로 추가된 카테고리
        const ordered = parsedOrder.filter((cat: string) => categories.includes(cat));
        const newCategories = categories.filter(cat => !parsedOrder.includes(cat));
        return [...ordered, ...newCategories];
      } catch (e) {
        console.error('[LanguageContext] Failed to parse category order:', e);
      }
    }
    
    // 저장된 순서가 없으면 기본 순서 사용
    const defaultOrder = ["start", "login", "app", "member", "recipe", "settings", "notice"];
    const ordered = defaultOrder.filter(cat => categories.includes(cat));
    const newCategories = categories.filter(cat => !defaultOrder.includes(cat));
    
    return [...ordered, ...newCategories];
  };

  // 🆕 카테고리별 페이지 목록 가져오기 (번역 키 기반)
  const getPagesByCategory = (categoryId: string): string[] => {
    // section.{category}.{page} 형태의 키 찾기
    const sectionPrefix = `section.${categoryId}.`;
    const sectionKeys = Object.keys(translations.ko).filter(key => key.startsWith(sectionPrefix));
    const pageNames = sectionKeys.map(key => key.replace(sectionPrefix, ''));
    
    // 전체 페이지 ID 생성 ({category}-{page})
    const pageIds = pageNames.map(pageName => `${categoryId}-${pageName}`);
    
    // 저장된 순서가 있으면 사용
    const orderKey = `__pageOrder.${categoryId}`;
    const savedOrder = translations.ko[orderKey];
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        // 저장된 순서에 있는 페이지 + 새로 추가된 페이지
        const ordered = parsedOrder.filter((id: string) => pageIds.includes(id));
        const newPages = pageIds.filter(id => !parsedOrder.includes(id));
        return [...ordered, ...newPages];
      } catch (e) {
        console.error('[LanguageContext] Failed to parse page order:', e);
      }
    }
    
    return pageIds;
  };

  // 🆕 전체 페이지 목록 가져오기 (모든 카테고리의 페이지)
  const getAllPages = (): Array<{ id: string; title: string; category: string }> => {
    const allPages: Array<{ id: string; title: string; category: string }> = [];
    const categories = getAllCategories();
    
    categories.forEach(categoryId => {
      const pageIds = getPagesByCategory(categoryId);
      pageIds.forEach(pageId => {
        // 페이지 제목 가져오기
        const titleKey = `${pageId}.title`;
        const title = (translations[language][titleKey] || pageId) as string;
        
        allPages.push({
          id: pageId,
          title: title,
          category: categoryId,
        });
      });
    });
    
    return allPages;
  };

  // 🆕 대메뉴 삭제 (하위 페이지도 모두 삭제)
  const deleteCategory = (categoryId: string) => {
    console.log('[LanguageContext] Deleting category:', categoryId);
    
    // 1. 해당 카테고리의 모든 페이지 찾기
    const pages = getPagesByCategory(categoryId);
    
    // 2. 각 페이지 삭제 (deletePage가 자동으로 이미지도 삭제함)
    pages.forEach(pageId => {
      deletePage(pageId);
    });
    
    // 3. 카테고리 번역 키 삭제
    delete translations.ko[`category.${categoryId}`];
    delete translations.en[`category.${categoryId}`];
    
    // 4. section.{category}.* 키 모두 삭제
    const sectionPrefix = `section.${categoryId}.`;
    Object.keys(translations.ko).forEach(key => {
      if (key.startsWith(sectionPrefix)) {
        delete translations.ko[key];
        delete translations.en[key];
      }
    });
    
    // 리렌더링 트리거
    setUpdateTrigger(prev => prev + 1);
    
    // Supabase 저장 (수동 저장으로 변경)
    // saveToSupabase();
    
    console.log('[LanguageContext] Category deleted successfully');
  };

  // 🆕 소메뉴(페이지) 삭제
  const deletePage = (pageId: string) => {
    console.log('[LanguageContext] Deleting page:', pageId);
    
    // 🆕 0. 이미지 URL 추출 및 삭제
    const imageUrls: string[] = [];
    const pagePrefix = `${pageId}.`;
    
    // header-image 추출
    const headerImageKey = `${pageId}.header-image`;
    if (translations.ko[headerImageKey]) {
      const headerImage = translations.ko[headerImageKey] as string;
      if (headerImage && headerImage.includes('make-8aea8ee5-manual-images')) {
        imageUrls.push(headerImage);
      }
    }
    
    // step1~10.image 추출
    for (let i = 1; i <= 10; i++) {
      const stepImageKey = `${pageId}.step${i}.image`;
      if (translations.ko[stepImageKey]) {
        const stepImage = translations.ko[stepImageKey] as string;
        if (stepImage && stepImage.includes('make-8aea8ee5-manual-images')) {
          imageUrls.push(stepImage);
        }
      }
    }
    
    // 🆕 Storage에서 이미지 삭제 (비동기, 에러 무시)
    if (imageUrls.length > 0) {
      console.log('[LanguageContext] Deleting images:', imageUrls);
      imageUrls.forEach(async (imageUrl) => {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-8aea8ee5/admin/delete-image`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({ imageUrl }),
            }
          );
          
          if (response.ok) {
            console.log('[LanguageContext] Image deleted successfully:', imageUrl);
          } else {
            console.warn('[LanguageContext] Image delete failed:', imageUrl, await response.text());
          }
        } catch (error) {
          console.warn('[LanguageContext] Image delete error (ignored):', error);
        }
      });
    }
    
    // 1. 페이지 관련 모든 번역 키 삭제
    
    // 한국어/영어 번역 키 삭제
    Object.keys(translations.ko).forEach(key => {
      if (key.startsWith(pagePrefix)) {
        delete translations.ko[key];
        delete translations.en[key];
      }
    });
    
    // 2. Visibility 키 삭제
    Object.keys(commonVisibility).forEach(key => {
      if (key.startsWith(pagePrefix)) {
        delete commonVisibility[key];
      }
    });
    
    // 3. section.{category}.{page} 키 삭제
    const parts = pageId.split('-');
    if (parts.length >= 2) {
      const categoryId = parts[0];
      const pageName = parts.slice(1).join('-');
      const sectionKey = `section.${categoryId}.${pageName}`;
      delete translations.ko[sectionKey];
      delete translations.en[sectionKey];
    }
    
    // 4. 페이지 메타데이터 삭제
    if (pageMetadata[pageId]) {
      delete pageMetadata[pageId];
    }
    
    // 리렌더링 트리거
    setUpdateTrigger(prev => prev + 1);
    
    // Supabase 저장 (수동 저장으로 변경)
    // saveToSupabase();
    
    console.log('[LanguageContext] Page deleted successfully');
  };

  // 🆕 대메뉴 순서 변경
  const reorderCategories = (newOrder: string[]) => {
    console.log('[LanguageContext] Reordering categories:', newOrder);
    
    // 카테고리 순서를 저장할 키
    translations.ko['__categoryOrder'] = JSON.stringify(newOrder);
    translations.en['__categoryOrder'] = JSON.stringify(newOrder);
    
    // 리렌더링 트리거
    setUpdateTrigger(prev => prev + 1);
    
    // Supabase 저장 (수동 저장으로 변경)
    // saveToSupabase();
    
    console.log('[LanguageContext] Categories reordered successfully');
  };

  // 🆕 소메뉴 순서 변경
  const reorderPages = (categoryId: string, newOrder: string[]) => {
    console.log('[LanguageContext] Reordering pages in category:', categoryId, newOrder);
    
    // 페이지 순서를 저장할 키
    const orderKey = `__pageOrder.${categoryId}`;
    translations.ko[orderKey] = JSON.stringify(newOrder);
    translations.en[orderKey] = JSON.stringify(newOrder);
    
    // 리렌더링 트리거
    setUpdateTrigger(prev => prev + 1);
    
    // Supabase 저장 (수동 저장으로 변경)
    // saveToSupabase();
    
    console.log('[LanguageContext] Pages reordered successfully');
  };

  // 🆕 특정 언어 번역 가져오기
  const getTranslation = (key: string, lang: Language) => {
    return translations[lang][key];
  };

  // ✅ Context value를 useMemo로 최적화
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextValue = useMemo(() => ({
    language, 
    setLanguage, 
    t, 
    updateTranslation,
    updatePageData,
    getPageLayout,
    setPageLayout,
    getTranslationKey, // 🆕 번역 키 가져오기
    addCategory,
    updateCategory,
    addPage,
    deleteCategory,
    deletePage,
    getAllCategories,
    getPagesByCategory,
    getAllPages, // 🆕 전체 페이지 목록 가져오기
    reorderCategories,
    reorderPages,
    saveChanges: saveToSupabase,
    getTranslation,
    loadFromSupabase, // 🆕 강제 갱신용
    updateTrigger, // 🆕 업데이트 트리거 제공
  }), [language, t, updateTranslation, saveToSupabase, loadFromSupabase, updateTrigger]);

  console.log('[LanguageProvider] Render decision:', { 
    isLoading, 
    hasChildren: !!children,
    childrenType: typeof children 
  });

  return (
    <LanguageContext.Provider value={contextValue}>
      {isLoading ? (
        (() => {
          console.log('[LanguageProvider] Rendering loading screen');
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
          );
        })()
      ) : (
        (() => {
          console.log('[LanguageProvider] Rendering children');
          return children;
        })()
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider"
    );
  }
  return context;
}
