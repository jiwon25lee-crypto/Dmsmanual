/**
 * 페이지 데이터 로딩/저장 헬퍼 함수
 * PageEditor에서 반복되는 코드를 재사용 가능하도록 분리
 */

import { Language } from '../components/LanguageContext';

export interface StepData {
  number: number;
  visible: boolean;
  imageVisible: boolean;
  title: { ko: string; en: string };
  desc: { ko: string; en: string };
  image: { ko: string; en: string };
}

export interface FeatureCardData {
  number: number;
  visible: boolean;
  title: { ko: string; en: string };
  desc: { ko: string; en: string };
  icon: string;
}

/**
 * Default 페이지의 Step 1-10 로드
 */
export function loadSteps(
  pageId: string,
  maxSteps: number,
  getTranslation: (key: string, lang: Language) => any,
  t: (key: string) => any
): StepData[] {
  const steps: StepData[] = [];

  for (let i = 1; i <= maxSteps; i++) {
    const titleKo = getTranslation(`${pageId}.step${i}.title`, 'ko') as string;

    // 한국어 제목이 없으면 해당 Step은 존재하지 않음
    if (!titleKo) continue;

    steps.push({
      number: i,
      visible: t(`${pageId}.step${i}.visible`) === true,
      imageVisible: t(`${pageId}.step${i}.image-visible`) === true,
      title: {
        ko: titleKo,
        en: (getTranslation(`${pageId}.step${i}.title`, 'en') || '') as string,
      },
      desc: {
        ko: (getTranslation(`${pageId}.step${i}.desc`, 'ko') || '') as string,
        en: (getTranslation(`${pageId}.step${i}.desc`, 'en') || '') as string,
      },
      image: {
        ko: (getTranslation(`${pageId}.step${i}.image`, 'ko') || '') as string,
        en: (getTranslation(`${pageId}.step${i}.image`, 'en') || '') as string,
      },
    });
  }

  return steps;
}

/**
 * Features 페이지의 Feature 카드 로드
 */
export function loadFeatures(
  pageId: string,
  maxFeatures: number,
  getTranslation: (key: string, lang: Language) => any,
  t: (key: string) => any
): FeatureCardData[] {
  const features: FeatureCardData[] = [];

  for (let i = 1; i <= maxFeatures; i++) {
    const titleKo = getTranslation(`${pageId}.feature${i}.title`, 'ko') as string;

    if (!titleKo) continue;

    features.push({
      number: i,
      visible: t(`${pageId}.feature${i}.visible`) === true,
      title: {
        ko: titleKo,
        en: (getTranslation(`${pageId}.feature${i}.title`, 'en') || '') as string,
      },
      desc: {
        ko: (getTranslation(`${pageId}.feature${i}.desc`, 'ko') || '') as string,
        en: (getTranslation(`${pageId}.feature${i}.desc`, 'en') || '') as string,
      },
      icon: (getTranslation(`${pageId}.feature${i}.icon`, 'ko') || '📄') as string,
    });
  }

  return features;
}

/**
 * 기본 페이지 정보 로드 (제목, 소개, 가이드 제목, 헤더 이미지)
 */
export function loadBasicPageInfo(
  pageId: string,
  getTranslation: (key: string, lang: Language) => any
) {
  return {
    title: {
      ko: (getTranslation(`${pageId}.title`, 'ko') || '') as string,
      en: (getTranslation(`${pageId}.title`, 'en') || '') as string,
    },
    intro: {
      ko: (getTranslation(`${pageId}.intro`, 'ko') || '') as string,
      en: (getTranslation(`${pageId}.intro`, 'en') || '') as string,
    },
    guideTitle: {
      ko: (getTranslation(`${pageId}.guide-title`, 'ko') || '') as string,
      en: (getTranslation(`${pageId}.guide-title`, 'en') || '') as string,
    },
    headerImage: {
      ko: (getTranslation(`${pageId}.header-image`, 'ko') || '') as string,
      en: (getTranslation(`${pageId}.header-image`, 'en') || '') as string,
    },
    headerImageEnabled: !!(getTranslation(`${pageId}.header-image`, 'ko') as string),
    headerImageInputMethod: 'upload' as 'upload' | 'url',
  };
}

/**
 * 페이지 데이터 검증
 */
export function validatePageData(data: any): string[] {
  const errors: string[] = [];

  // 제목 필수
  if (!data.title?.ko?.trim()) {
    errors.push('한국어 제목을 입력하세요');
  }

  if (!data.title?.en?.trim()) {
    errors.push('영어 제목을 입력하세요');
  }

  // 소개 필수
  if (!data.intro?.ko?.trim()) {
    errors.push('한국어 소개를 입력하세요');
  }

  if (!data.intro?.en?.trim()) {
    errors.push('영어 소개를 입력하세요');
  }

  return errors;
}
