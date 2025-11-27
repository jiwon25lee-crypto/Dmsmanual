import { useLanguage } from "../LanguageContext";
import {
  ImageContainer,
  Tooltip,
  Step,
} from "../common/PageComponents";
import { getPageImage } from "../common/PageImages";

interface DefaultPageProps {
  pageId?: string;
}

export function DefaultPage({
  pageId = "default",
}: DefaultPageProps) {
  const { t, language } = useLanguage();

  // 🆕 이미지 URL 안전하게 가져오기 (키 값이 반환되는 경우 처리)
  const getImageUrl = (key: string) => {
    const value = t(key) as string;
    // 값이 없거나 키 값과 동일하면(번역 없음) 빈 문자열 반환
    if (!value || value === key) return "";
    return value;
  };

  // 🆕 Step이 존재하는지 확인하는 함수
  const hasStep = (stepNum: number) => {
    const titleKey = `${pageId}.step${stepNum}.title`;
    const title = t(titleKey) as string;
    // 제목이 존재하고 키 값이 아닌 경우 = Step 존재
    return title && title !== titleKey;
  };

  // 🆕 Step이 visible인지 확인하는 함수
  const isStepVisible = (stepNum: number) => {
    // Step 데이터가 없으면 무조건 숨김
    if (!hasStep(stepNum)) return false;
    // Step 데이터가 있으면 visible 값 확인 (명시적으로 false가 아니면 표시)
    const visibleValue = t(`${pageId}.step${stepNum}.visible`);
    return visibleValue !== false;
  };

  // 🆕 Step 이미지가 visible인지 확인하는 함수
  const isStepImageVisible = (stepNum: number) => {
    // 이미지 URL이 없으면 숨김
    if (!getImageUrl(`${pageId}.step${stepNum}.image`)) return false;
    // 이미지가 있으면 image-visible 값 확인 (명시적으로 false가 아니면 표시)
    const visibleValue = t(`${pageId}.step${stepNum}.image-visible`);
    return visibleValue !== false;
  };

  return (
    <>
      {/* 제목 */}
      <h2 className="mb-6">{t(`${pageId}.title`)}</h2>

      {/* 최상단 이미지 (옵션) */}
      {getImageUrl(`${pageId}.header-image`) && (
        <ImageContainer
          src={getImageUrl(`${pageId}.header-image`)}
          alt={t(`${pageId}.title`) as string}
        />
      )}

      {/* 소개 */}
      <p className="text-foreground mb-6 leading-relaxed">
        {t(`${pageId}.intro`)}
      </p>

      <h3 className="mb-6">{t(`${pageId}.guide-title`)}</h3>

      {/* Step 1 */}
      {isStepVisible(1) && (
        <div className="mb-12">
          {/* 넘버 + 제목 */}
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              1
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step1.title`)}
            </h3>
          </div>
          {/* 이미지 */}
          {isStepImageVisible(1) && (
            <ImageContainer
              src={getImageUrl(`${pageId}.step1.image`)}
              alt={t(`${pageId}.step1.title`) as string}
            />
          )}
          {/* 설명 */}
          <p className="text-muted-foreground">
            {t(`${pageId}.step1.desc`)}
          </p>
        </div>
      )}

      {/* Step 2 */}
      {isStepVisible(2) && (
        <div className="mb-12">
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              2
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step2.title`)}
            </h3>
          </div>
          {isStepImageVisible(2) && (
            <ImageContainer
              src={getImageUrl(`${pageId}.step2.image`)}
              alt={t(`${pageId}.step2.title`) as string}
            />
          )}
          <p className="text-muted-foreground">
            {t(`${pageId}.step2.desc`)}
          </p>
        </div>
      )}

      {/* Step 3 */}
      {isStepVisible(3) && (
        <div className="mb-12">
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              3
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step3.title`)}
            </h3>
          </div>
          {isStepImageVisible(3) && (
            <ImageContainer
              src={getImageUrl(`${pageId}.step3.image`)}
              alt={t(`${pageId}.step3.title`) as string}
            />
          )}
          <p className="text-muted-foreground">
            {t(`${pageId}.step3.desc`)}
          </p>
        </div>
      )}

      {/* Step 4 */}
      {isStepVisible(4) && (
        <div className="mb-12">
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              4
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step4.title`)}
            </h3>
          </div>
          {isStepImageVisible(4) && (
            <ImageContainer
              src={getImageUrl(`${pageId}.step4.image`)}
              alt={t(`${pageId}.step4.title`) as string}
            />
          )}
          <p className="text-muted-foreground">
            {t(`${pageId}.step4.desc`)}
          </p>
        </div>
      )}

      {/* Step 5 */}
      {isStepVisible(5) && (
        <div className="mb-12">
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              5
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step5.title`)}
            </h3>
          </div>
          {isStepImageVisible(5) && (
            <ImageContainer
              src={getImageUrl(`${pageId}.step5.image`)}
              alt={t(`${pageId}.step5.title`) as string}
            />
          )}
          <p className="text-muted-foreground">
            {t(`${pageId}.step5.desc`)}
          </p>
        </div>
      )}

      {/* Step 6 */}
      {isStepVisible(6) && (
        <div className="mb-12">
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              6
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step6.title`)}
            </h3>
          </div>
          {isStepImageVisible(6) && (
            <ImageContainer
              src={getImageUrl(`${pageId}.step6.image`)}
              alt={t(`${pageId}.step6.title`) as string}
            />
          )}
          <p className="text-muted-foreground">
            {t(`${pageId}.step6.desc`)}
          </p>
        </div>
      )}

      {/* Step 7 */}
      {isStepVisible(7) && (
        <div className="mb-12">
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              7
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step7.title`)}
            </h3>
          </div>
          {isStepImageVisible(7) && (
            <ImageContainer
              src={getImageUrl(`${pageId}.step7.image`)}
              alt={t(`${pageId}.step7.title`) as string}
            />
          )}
          <p className="text-muted-foreground">
            {t(`${pageId}.step7.desc`)}
          </p>
        </div>
      )}

      {/* Step 8 */}
      {isStepVisible(8) && (
        <div className="mb-12">
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              8
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step8.title`)}
            </h3>
          </div>
          {isStepImageVisible(8) && (
            <ImageContainer
              src={getImageUrl(`${pageId}.step8.image`)}
              alt={t(`${pageId}.step8.title`) as string}
            />
          )}
          <p className="text-muted-foreground">
            {t(`${pageId}.step8.desc`)}
          </p>
        </div>
      )}

      {/* Step 9 */}
      {isStepVisible(9) && (
        <div className="mb-12">
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              9
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step9.title`)}
            </h3>
          </div>
          {isStepImageVisible(9) && (
            <ImageContainer
              src={getImageUrl(`${pageId}.step9.image`)}
              alt={t(`${pageId}.step9.title`) as string}
            />
          )}
          <p className="text-muted-foreground">
            {t(`${pageId}.step9.desc`)}
          </p>
        </div>
      )}

      {/* Step 10 */}
      {isStepVisible(10) && (
        <div className="mb-12">
          <div className="flex gap-2 mb-4 items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-[12px]">
              10
            </div>
            <h3 className="text-foreground">
              {t(`${pageId}.step10.title`)}
            </h3>
          </div>
          {isStepImageVisible(10) && (
            <ImageContainer
              src={getImageUrl(`${pageId}.step10.image`)}
              alt={t(`${pageId}.step10.title`) as string}
            />
          )}
          <p className="text-muted-foreground">
            {t(`${pageId}.step10.desc`)}
          </p>
        </div>
      )}
    </>
  );
}