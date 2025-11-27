/**
 * 페이지별 이미지 통합 관리
 * 
 * 사용법:
 * 1. Figma에서 이미지 import
 * 2. 아래 import 구문 추가
 * 3. PAGE_IMAGES 객체에 pageId 추가
 * 
 * 예시:
 * import newPageKo from "figma:asset/...";
 * import newPageEn from "figma:asset/...";
 * 
 * export const PAGE_IMAGES = {
 *   ...
 *   "new-page": { ko: newPageKo, en: newPageEn },
 * };
 */

// ========================================
// 📸 이미지 Import
// ========================================

// app-connection: DMS-상식플러스(App) 연결
import appConnectionKo from "figma:asset/15e4e816c4b3354ab1ebec43a5d9af88afbb92e7.png";
import appConnectionEn from "figma:asset/c6cbfd237e88cc26dad54d53cc74e833e24a7d51.png";

// login-admin: 기관 대표 관리자 회원가입
// TODO: Figma에서 import 후 아래 경로를 실제 경로로 교체하세요
// import loginAdminKo from "figma:asset/YOUR_HASH.png";
// import loginAdminEn from "figma:asset/YOUR_HASH.png";

// ========================================
// 📦 페이지별 이미지 매핑
// ========================================

type Language = "ko" | "en";

export const PAGE_IMAGES: Record<string, Record<Language, string>> = {
  // app-connection 페이지
  "app-connection": {
    ko: appConnectionKo,
    en: appConnectionEn,
  },

  // login-admin 페이지 (이미지 준비되면 주석 해제)
  // "login-admin": {
  //   ko: loginAdminKo,
  //   en: loginAdminEn,
  // },

  // 새 페이지 추가 예시:
  // "member-dashboard": {
  //   ko: memberDashboardKo,
  //   en: memberDashboardEn,
  // },
};

/**
 * 페이지 이미지 가져오기 헬퍼 함수
 * @param pageId 페이지 ID
 * @param language 언어 (ko | en)
 * @returns 이미지 URL 또는 undefined
 */
export function getPageImage(pageId: string, language: Language): string | undefined {
  return PAGE_IMAGES[pageId]?.[language];
}
