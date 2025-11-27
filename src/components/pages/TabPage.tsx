import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ImageContainer } from "../common/PageComponents";

interface TabPageProps {
  pageId?: string;
}

export function TabPage({ pageId = "member-dashboard" }: TabPageProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  // 🆕 Overview 탭 데이터 로드
  const overviewTitle = t(`${pageId}.overview.title`) as string;
  const overviewDesc = t(`${pageId}.overview.desc`) as string;
  const overviewImage = t(`${pageId}.overview.image`) as string;

  // 🆕 Features 탭 데이터 로드 (feature1~feature10)
  const features = [];
  for (let i = 1; i <= 10; i++) {
    const titleKey = `${pageId}.features.feature${i}.title`;
    const title = t(titleKey) as string;
    
    // Feature가 존재하고 visible이 true인 경우만 표시
    if (title && title !== titleKey && t(`${pageId}.features.feature${i}.visible`)) {
      features.push({
        number: i,
        title: title,
        desc: (t(`${pageId}.features.feature${i}.desc`) || "") as string,
        icon: (t(`${pageId}.features.feature${i}.icon`) || "🎯") as string,
      });
    }
  }

  // 🆕 Guide 탭 데이터 로드 (step1~step10)
  const guideSteps = [];
  for (let i = 1; i <= 10; i++) {
    const titleKey = `${pageId}.guide.step${i}.title`;
    const title = t(titleKey) as string;
    
    // Step이 존재하고 visible이 true인 경우만 표시
    if (title && title !== titleKey && t(`${pageId}.guide.step${i}.visible`)) {
      guideSteps.push({
        number: i,
        title: title,
        desc: (t(`${pageId}.guide.step${i}.desc`) || "") as string,
        image: (t(`${pageId}.guide.step${i}.image`) || "") as string,
      });
    }
  }

  return (
    <>
      <h1 className="mb-6">{t(`${pageId}.title`)}</h1>
      <p className="text-foreground mb-8 leading-relaxed">
        {t(`${pageId}.intro`)}
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">📄 Overview</TabsTrigger>
          <TabsTrigger value="features">🎯 Features</TabsTrigger>
          <TabsTrigger value="guide">📋 Guide</TabsTrigger>
        </TabsList>

        {/* Overview 탭 */}
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{overviewTitle || "Overview"}</CardTitle>
              <CardDescription>{overviewDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {overviewImage && (
                <ImageContainer
                  src={overviewImage}
                  alt="Overview"
                  maxWidth="800px"
                />
              )}
              {!overviewImage && (
                <p className="text-muted-foreground text-center py-8">
                  💡 백오피스에서 Overview 이미지를 추가하세요.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features 탭 */}
        <TabsContent value="features" className="mt-6">
          {features.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <Card key={feature.number}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div className="flex-1">
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription>{feature.desc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="mb-2">아직 Feature 카드가 없습니다.</p>
                <p className="text-sm">백오피스에서 Feature 카드를 추가하세요.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Guide 탭 */}
        <TabsContent value="guide" className="mt-6">
          {guideSteps.length > 0 ? (
            <div className="space-y-6">
              {guideSteps.map((step) => (
                <Card key={step.number}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center">
                        <span>{step.number}</span>
                      </div>
                      <div className="flex-1">
                        <CardTitle>{step.title}</CardTitle>
                        <CardDescription>{step.desc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {step.image && (
                    <CardContent>
                      <ImageContainer
                        src={step.image}
                        alt={step.title}
                        maxWidth="600px"
                      />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="mb-2">아직 Guide Step이 없습니다.</p>
                <p className="text-sm">백오피스에서 Guide Step을 추가하세요.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
