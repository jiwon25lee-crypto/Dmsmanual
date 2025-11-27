/**
 * 데이터 마이그레이션 헬퍼
 * 
 * 기존 pages.ts와 LanguageContext.tsx 데이터를 Supabase DB로 이전
 * 
 * 사용법:
 * 1. 백오피스 대시보드에서 "데이터베이스 초기화" 버튼 클릭
 * 2. 개발자 콘솔에서 이 스크립트 실행
 */

import { PAGE_CONFIGS } from "../config/pages";
import { pagesApi, translationsApi, visibilityApi } from "./supabase/admin-client";

/**
 * pages.ts 데이터 마이그레이션
 */
export async function migratePages() {
  console.log("📄 Migrating pages...");
  
  for (const config of PAGE_CONFIGS) {
    try {
      await pagesApi.create({
        id: config.id,
        component: config.component,
        category: config.category,
        order_num: config.order,
        is_first_in_category: config.isFirstInCategory ?? false,
      });
      console.log(`✅ Created page: ${config.id}`);
    } catch (error) {
      console.error(`❌ Failed to create page ${config.id}:`, error);
    }
  }
}

/**
 * LanguageContext.tsx 번역 데이터 마이그레이션
 * 
 * 수동으로 번역 객체를 전달해야 합니다.
 */
export async function migrateTranslations(koTranslations: Record<string, any>, enTranslations: Record<string, any>) {
  console.log("🌐 Migrating translations...");
  
  const allKeys = new Set([
    ...Object.keys(koTranslations),
    ...Object.keys(enTranslations),
  ]);

  const translations = Array.from(allKeys).map((key) => {
    const parts = key.split(".");
    const pageId = parts[0];
    const translationKey = parts.slice(1).join(".");

    return {
      page_id: pageId,
      key: translationKey,
      value_ko: koTranslations[key] || null,
      value_en: enTranslations[key] || null,
    };
  });

  try {
    await translationsApi.batchUpsert(translations);
    console.log(`✅ Migrated ${translations.length} translations`);
  } catch (error) {
    console.error("❌ Failed to migrate translations:", error);
  }
}

/**
 * commonVisibility 데이터 마이그레이션
 */
export async function migrateVisibility(commonVisibility: Record<string, boolean>) {
  console.log("👁️ Migrating visibility...");
  
  const visibilityData: Array<{
    page_id: string;
    step_num: number;
    is_visible?: boolean;
    image_visible?: boolean;
  }> = [];

  for (const [key, value] of Object.entries(commonVisibility)) {
    const parts = key.split(".");
    if (parts.length < 3) continue;

    const pageId = parts[0];
    const stepKey = parts[1]; // 'step1', 'step2', etc.
    const type = parts[2]; // 'visible' or 'image-visible'

    const stepNum = parseInt(stepKey.replace("step", ""));
    if (isNaN(stepNum)) continue;

    // 같은 page_id + step_num 조합 찾기
    let existing = visibilityData.find(
      (v) => v.page_id === pageId && v.step_num === stepNum
    );

    if (!existing) {
      existing = {
        page_id: pageId,
        step_num: stepNum,
      };
      visibilityData.push(existing);
    }

    // 타입에 따라 설정
    if (type === "visible") {
      existing.is_visible = value;
    } else if (type === "image-visible") {
      existing.image_visible = value;
    }
  }

  try {
    await visibilityApi.batchUpsert(visibilityData as any);
    console.log(`✅ Migrated ${visibilityData.length} visibility settings`);
  } catch (error) {
    console.error("❌ Failed to migrate visibility:", error);
  }
}

/**
 * 전체 마이그레이션 실행
 */
export async function migrateAll(
  koTranslations: Record<string, any>,
  enTranslations: Record<string, any>,
  commonVisibility: Record<string, boolean>
) {
  console.log("🚀 Starting full migration...");
  
  await migratePages();
  await migrateTranslations(koTranslations, enTranslations);
  await migrateVisibility(commonVisibility);
  
  console.log("✅ Migration completed!");
}

// 개발자 콘솔에서 사용할 수 있도록 전역 노출
if (typeof window !== "undefined") {
  (window as any).migrate = {
    pages: migratePages,
    translations: migrateTranslations,
    visibility: migrateVisibility,
    all: migrateAll,
  };
}
