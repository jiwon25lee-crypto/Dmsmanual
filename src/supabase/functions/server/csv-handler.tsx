import * as kv from './kv_store.tsx';

interface CSVRow {
  category_id: string;
  category_name_ko: string;   // 🆕 대메뉴 한국어 이름
  category_name_en: string;   // 🆕 대메뉴 영어 이름
  page_id: string;
  page_name_ko: string;       // 🆕 소메뉴 한국어 이름
  page_name_en: string;       // 🆕 소메뉴 영어 이름
  layout: string;
  field: string;
  KO: string;
  EN: string;
}

interface TranslationData {
  translations: {
    ko: Record<string, string>;
    en: Record<string, string>;
  };
  commonVisibility: Record<string, boolean>;
  pageMetadata: Record<string, any>;
  menuStructure: any[];
}

/**
 * CSV 데이터를 translations 객체로 변환
 */
export function transformCSVToTranslations(csvData: CSVRow[]): TranslationData {
  console.log('[CSV Transform] Processing rows:', csvData.length);

  const translations = {
    ko: {} as Record<string, string>,
    en: {} as Record<string, string>
  };

  const commonVisibility: Record<string, boolean> = {};
  const pageMetadata: Record<string, any> = {};
  const categorySet = new Set<string>();
  const pagesByCategory: Record<string, Set<string>> = {};
  const stepsByPage: Record<string, Set<number>> = {};
  const categoryTitles: Record<string, { ko: string; en: string }> = {};
  const pageTitles: Record<string, { ko: string; en: string }> = {};

  csvData.forEach((row, index) => {
    const { category_id, category_name_ko, category_name_en, page_id, page_name_ko, page_name_en, layout, field, KO, EN } = row;

    // 카테고리 추적
    categorySet.add(category_id);
    if (!pagesByCategory[category_id]) {
      pagesByCategory[category_id] = new Set();
    }
    pagesByCategory[category_id].add(page_id);

    // Translation 키 생성
    const translationKey = `${page_id}.${field}`;

    // Translations 저장
    translations.ko[translationKey] = KO;
    translations.en[translationKey] = EN;

    // 🆕 title 필드면 카테고리/페이지 제목으로도 저장
    if (field === 'title') {
      pageTitles[page_id] = { ko: KO, en: EN };
      
      // 카테고리 제목이 아직 없으면 첫 페이지 제목으로 설정
      if (!categoryTitles[category_id]) {
        categoryTitles[category_id] = { ko: KO, en: EN };
      }
    }

    // Step 번호 추적 (step1, step2, ...)
    const stepMatch = field.match(/^step(\d+)\./);
    if (stepMatch) {
      const stepNumber = parseInt(stepMatch[1]);
      if (!stepsByPage[page_id]) {
        stepsByPage[page_id] = new Set();
      }
      stepsByPage[page_id].add(stepNumber);
    }

    // PageMetadata 저장 (각 페이지당 한 번만)
    if (!pageMetadata[page_id]) {
      pageMetadata[page_id] = {
        layout: layout || 'default'
      };
      if (layout === 'accordion') {
        pageMetadata[page_id].translationKey = page_id;
      }
    }
  });

  // 🆕 카테고리 및 섹션 번역 키 자동 생성
  Object.entries(pagesByCategory).forEach(([categoryId, pages]) => {
    // 카테고리 제목 생성: category.{categoryId}
    if (categoryTitles[categoryId]) {
      translations.ko[`category.${categoryId}`] = categoryTitles[categoryId].ko;
      translations.en[`category.${categoryId}`] = categoryTitles[categoryId].en;
    }

    // 각 페이지의 섹션 제목 생성: section.{categoryId}.{pageName}
    pages.forEach(pageId => {
      if (pageTitles[pageId]) {
        // pageName 추출: "signup-admin" → "admin" (카테고리 prefix 제거)
        const pageName = pageId.replace(`${categoryId}-`, '');
        const sectionKey = `section.${categoryId}.${pageName}`;
        
        translations.ko[sectionKey] = pageTitles[pageId].ko;
        translations.en[sectionKey] = pageTitles[pageId].en;
      }
    });
  });

  // 🆕 Step visible/image-visible 자동 생성
  Object.entries(stepsByPage).forEach(([pageId, steps]) => {
    steps.forEach(stepNum => {
      const visibleKey = `${pageId}.step${stepNum}.visible`;
      const imageVisibleKey = `${pageId}.step${stepNum}.image-visible`;
      
      // visible이 명시적으로 설정되지 않았으면 true로 설정
      if (!(visibleKey in commonVisibility)) {
        commonVisibility[visibleKey] = true;
      }
      
      // image-visible이 명시적으로 설정되지 않았으면 false로 설정
      if (!(imageVisibleKey in commonVisibility)) {
        commonVisibility[imageVisibleKey] = false;
      }
    });
  });

  // 🆕 Feature visible 자동 생성 (features 레이아웃용)
  Object.entries(pageMetadata).forEach(([pageId, metadata]) => {
    if (metadata.layout === 'features') {
      // feature1~10 visible 기본값 생성
      for (let i = 1; i <= 10; i++) {
        const featureVisibleKey = `${pageId}.feature${i}.visible`;
        const hasTitleOrDesc = 
          translations.ko[`${pageId}.feature${i}.title`] || 
          translations.ko[`${pageId}.feature${i}.desc`];
        
        if (hasTitleOrDesc && !(featureVisibleKey in commonVisibility)) {
          commonVisibility[featureVisibleKey] = true;
        }
      }
    }
  });

  // MenuStructure 생성
  const menuStructure = Array.from(categorySet).map(categoryId => ({
    id: categoryId,
    pages: Array.from(pagesByCategory[categoryId] || [])
  }));

  console.log('[CSV Transform] Complete:', {
    categories: categorySet.size,
    pages: Object.keys(pageMetadata).length,
    koKeys: Object.keys(translations.ko).length,
    enKeys: Object.keys(translations.en).length,
    visibilityKeys: Object.keys(commonVisibility).length,
    stepsByPage: Object.keys(stepsByPage).length
  });

  return {
    translations,
    commonVisibility,
    pageMetadata,
    menuStructure
  };
}

/**
 * 현재 데이터를 CSV 형식으로 변환
 */
export async function downloadCSVData(): Promise<string> {
  console.log('[CSV Download] Starting download...');

  try {
    // 1. Supabase에서 데이터 로드
    const data = await kv.get('dms_manual_data_v1');
    
    if (!data || !data.translations) {
      throw new Error('데이터가 없습니다.');
    }

    console.log('[CSV Download] Data loaded:', {
      koKeys: Object.keys(data.translations.ko || {}).length,
      enKeys: Object.keys(data.translations.en || {}).length,
      menuStructure: data.menuStructure ? `${data.menuStructure.length} categories` : 'MISSING',
      pageMetadata: Object.keys(data.pageMetadata || {}).length
    });

    // 🔍 menuStructure 디버깅
    if (!data.menuStructure || data.menuStructure.length === 0) {
      console.warn('[CSV Download] ⚠️ menuStructure is missing or empty!');
      console.warn('[CSV Download] Available data keys:', Object.keys(data));
    } else {
      console.log('[CSV Download] menuStructure preview:', 
        data.menuStructure.slice(0, 2).map((c: any) => ({
          id: c.id,
          pagesCount: c.pages?.length || 0
        }))
      );
    }

    // 2. Translations를 CSV 행으로 변환
    const rows: CSVRow[] = [];
    const koTranslations = data.translations.ko || {};
    const enTranslations = data.translations.en || {};
    const pageMetadata = data.pageMetadata || {};

    Object.entries(koTranslations).forEach(([key, koValue]) => {
      const enValue = enTranslations[key] || '';
      
      // 🆕 자동 생성 키 및 내부 키는 제외
      if (
        key.startsWith('category.') || 
        key.startsWith('section.') ||
        key.startsWith('__pageOrder.') ||  // 페이지 순서 저장 키 제외
        key.startsWith('__')               // 모든 내부 키 제외
      ) {
        return;
      }

      // key 파싱: "page-id.field"
      const parts = key.split('.');
      if (parts.length < 2) return;

      const pageId = parts[0];
      const field = parts.slice(1).join('.');

      // category_id 찾기 (menuStructure에서)
      let categoryId = '';
      if (data.menuStructure) {
        for (const category of data.menuStructure) {
          if (category.pages && category.pages.includes(pageId)) {
            categoryId = category.id;
            break;
          }
        }
      }

      // layout 찾기
      const layout = pageMetadata[pageId]?.layout || 'default';

      // 🆕 대메뉴/소메뉴 이름 가져오기
      const categoryNameKo = koTranslations[`category.${categoryId}`] || categoryId;
      const categoryNameEn = enTranslations[`category.${categoryId}`] || categoryId;
      
      // section 키 생성: section.{categoryId}.{pageName}
      const pageName = pageId.replace(`${categoryId}-`, '');
      const sectionKey = `section.${categoryId}.${pageName}`;
      const pageNameKo = koTranslations[sectionKey] || koTranslations[`${pageId}.title`] || pageId;
      const pageNameEn = enTranslations[sectionKey] || enTranslations[`${pageId}.title`] || pageId;

      rows.push({
        category_id: categoryId,
        category_name_ko: categoryNameKo,
        category_name_en: categoryNameEn,
        page_id: pageId,
        page_name_ko: pageNameKo,
        page_name_en: pageNameEn,
        layout,
        field,
        KO: koValue as string,
        EN: enValue as string
      });
    });

    console.log('[CSV Download] Rows generated:', rows.length);

    // 3. CSV 문자열 생성
    const header = 'category_id,category_name_ko,category_name_en,page_id,page_name_ko,page_name_en,layout,field,KO,EN';
    const csvRows = rows.map(row => {
      return [
        escapeCSV(row.category_id),
        escapeCSV(row.category_name_ko),
        escapeCSV(row.category_name_en),
        escapeCSV(row.page_id),
        escapeCSV(row.page_name_ko),
        escapeCSV(row.page_name_en),
        escapeCSV(row.layout),
        escapeCSV(row.field),
        escapeCSV(row.KO),
        escapeCSV(row.EN)
      ].join(',');
    });

    const csv = [header, ...csvRows].join('\n');

    console.log('[CSV Download] ✅ CSV generated');

    return csv;

  } catch (error) {
    console.error('[CSV Download] ❌ Error:', error);
    throw error;
  }
}

/**
 * CSV 값 이스케이프 (쉼표, 따옴표, 줄바꿈 처리)
 */
function escapeCSV(value: string): string {
  if (!value) return '';
  
  // 쉼표, 따옴표, 줄바꿈이 있으면 큰따옴표로 감싸기
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // 큰따옴표는 두 개로 이스케이프
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}