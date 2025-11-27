import { useLanguage } from "../LanguageContext";
import { Card, CardContent } from "../ui/card";
import { ChevronRight } from "lucide-react";
import { ImageContainer } from "../common/PageComponents";

interface StartFeaturesPageProps {
  onSectionChange: (sectionId: string) => void;
}

// 카테고리별 아이콘 매핑 (기본값)
const CATEGORY_ICONS: Record<string, string> = {
  start: "📚",
  login: "🔐",
  app: "📱",
  member: "👥",
  recipe: "🍽️",
  settings: "⚙️",
  notice: "📢",
};

export function StartFeaturesPage({ onSectionChange }: StartFeaturesPageProps) {
  const { t, getAllCategories, getPagesByCategory } = useLanguage();

  // 🆕 Feature 카드 동적 로드 (feature1~feature10)
  const featureCards = [];
  for (let i = 1; i <= 10; i++) {
    const titleKey = `start-features.feature${i}.title`;
    const title = t(titleKey) as string;
    
    // Feature가 존재하는 경우 (제목이 키가 아닌 실제 값인지 체크)
    if (title && title !== titleKey) {
      const visibleValue = t(`start-features.feature${i}.visible`);
      
      // visible이 명시적으로 true인 경우만 표시
      if (visibleValue === true) {
        featureCards.push({
          id: `feature-${i}`,
          number: i,
          title: title,
          desc: (t(`start-features.feature${i}.desc`) || "") as string,
          icon: (t(`start-features.feature${i}.icon`) || "📄") as string,
          // 🆕 클릭 시 이동할 섹션 ID
          link: (t(`start-features.feature${i}.link`) || "") as string,
        });
      }
    }
  }
  
  console.log('[StartFeaturesPage] Loaded feature cards:', featureCards);

  // 🔄 Fallback: Feature 카드가 없으면 동적 대메뉴 카드 표시
  const allCategories = getAllCategories();
  const menuCategories = allCategories
    .filter(categoryId => categoryId !== "start" && categoryId !== "notice")
    .map((categoryId, index) => {
      const pages = getPagesByCategory(categoryId);
      const firstPageId = pages.length > 0 ? pages[0] : "";
      
      return {
        id: categoryId,
        titleKey: `category.${categoryId}`,
        descKey: `start-features.menu${index + 1}.desc`, // 설명은 기존 키 사용
        firstSectionId: firstPageId,
        icon: CATEGORY_ICONS[categoryId] || "📄",
      };
    });
  
  // Feature 카드 우선, 없으면 기존 메뉴 카드
  const cardsToDisplay = featureCards.length > 0 ? featureCards : menuCategories;

  return (
    <>
      <h1 className="mb-6">{t("start-features.title")}</h1>

      {/* 최상단 이미지 */}
      {t("start-features.header-image") && (
        <ImageContainer
          src={t("start-features.header-image") as string}
          alt={t("start-features.title") as string}
        />
      )}

      <p className="text-foreground mb-8 leading-relaxed">
        {t("start-features.intro")}
      </p>

      {/* 대메뉴 바로가기 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {featureCards.length > 0 ? (
          // 🆕 Feature 카드 표시 (백오피스에서 편집한 카드)
          featureCards.map((card) => (
            <Card
              key={card.id}
              className={`hover:effect-shadow-md transition-all duration-300 border-brand/50 ${
                card.link ? 'cursor-pointer hover:border-brand' : ''
              }`}
              onClick={() => card.link && onSectionChange(card.link)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{card.icon}</span>
                      <h3 className="text-foreground">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  {card.link && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : menuCategories.length > 0 ? (
          // 🔄 Fallback: 기존 대메뉴 카드 표시
          menuCategories.map((menu) => (
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
          ))
        ) : (
          // ⚠️ 카드가 하나도 없을 때
          <div className="col-span-2 py-12 text-center">
            <div className="bg-muted/20 border border-dashed border-border rounded-lg p-8">
              <p className="text-muted-foreground mb-2">
                📭 표시할 Feature 카드가 없습니다.
              </p>
              <p className="text-sm text-muted-foreground">
                관리자 페이지에서 Feature 카드를 추가하거나, 기존 카드의 "매뉴얼에 표시" 옵션을 활성화하세요.
              </p>
            </div>
          </div>
        )}
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