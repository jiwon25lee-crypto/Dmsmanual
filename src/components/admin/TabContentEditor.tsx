/**
 * 탭 컨텐츠 관리 컴포넌트
 * TabPage 레이아웃 전용
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { useLanguage } from "../LanguageContext";
import type { FeatureCardData } from "./FeatureCardsEditor";

interface StepData {
  number: number;
  visible: boolean;
  title: { ko: string; en: string };
  desc: { ko: string; en: string };
  image: string;
  imageInputMethod?: "upload" | "url";
}

export interface TabContentData {
  overview: {
    title: { ko: string; en: string };
    desc: { ko: string; en: string };
    image: string;
    imageInputMethod?: "upload" | "url";
  };
  features: FeatureCardData[];
  guide: StepData[];
}

interface TabContentEditorProps {
  pageId: string;
  onTabContentChange: (tabContent: TabContentData) => void;
}

export function TabContentEditor({ pageId, onTabContentChange }: TabContentEditorProps) {
  const { t, getTranslation } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  // LanguageContext에서 TabContent 데이터 로드
  const loadTabContent = (): TabContentData => {
    // Overview 탭 데이터
    const overview = {
      title: {
        ko: (getTranslation(`${pageId}.overview.title`, 'ko') || "") as string,
        en: (getTranslation(`${pageId}.overview.title`, 'en') || "") as string,
      },
      desc: {
        ko: (getTranslation(`${pageId}.overview.desc`, 'ko') || "") as string,
        en: (getTranslation(`${pageId}.overview.desc`, 'en') || "") as string,
      },
      image: (getTranslation(`${pageId}.overview.image`, 'ko') || "") as string,
      imageInputMethod: "upload" as "upload" | "url",
    };

    // Features 탭 데이터
    const features: FeatureCardData[] = [];
    for (let i = 1; i <= 10; i++) {
      const titleKey = `${pageId}.features.feature${i}.title`;
      const titleKo = getTranslation(titleKey, 'ko') as string;
      
      if (titleKo) {
        features.push({
          number: i,
          visible: t(`${pageId}.features.feature${i}.visible`) === true,
          title: {
            ko: titleKo,
            en: (getTranslation(titleKey, 'en') || "") as string,
          },
          desc: {
            ko: (getTranslation(`${pageId}.features.feature${i}.desc`, 'ko') || "") as string,
            en: (getTranslation(`${pageId}.features.feature${i}.desc`, 'en') || "") as string,
          },
          icon: (getTranslation(`${pageId}.features.feature${i}.icon`, 'ko') || "🎯") as string,
        });
      }
    }

    // Guide 탭 데이터
    const guide: StepData[] = [];
    for (let i = 1; i <= 10; i++) {
      const titleKey = `${pageId}.guide.step${i}.title`;
      const titleKo = getTranslation(titleKey, 'ko') as string;
      
      if (titleKo) {
        guide.push({
          number: i,
          visible: t(`${pageId}.guide.step${i}.visible`) === true,
          title: {
            ko: titleKo,
            en: (getTranslation(titleKey, 'en') || "") as string,
          },
          desc: {
            ko: (getTranslation(`${pageId}.guide.step${i}.desc`, 'ko') || "") as string,
            en: (getTranslation(`${pageId}.guide.step${i}.desc`, 'en') || "") as string,
          },
          image: (getTranslation(`${pageId}.guide.step${i}.image`, 'ko') || "") as string,
        });
      }
    }

    return { overview, features, guide };
  };

  const [tabContent, setTabContent] = useState<TabContentData>(loadTabContent);
  
  // tabContent 변경 시 상위로 전달
  useEffect(() => {
    onTabContentChange(tabContent);
  }, [tabContent]);

  // Overview 업데이트
  const updateOverview = (field: string, value: any) => {
    setTabContent({
      ...tabContent,
      overview: {
        ...tabContent.overview,
        [field]: value,
      },
    });
  };

  // Feature 추가
  const addFeature = () => {
    const newFeature: FeatureCardData = {
      number: tabContent.features.length + 1,
      visible: true,
      title: { ko: "", en: "" },
      desc: { ko: "", en: "" },
      icon: "🎯",
    };
    setTabContent({
      ...tabContent,
      features: [...tabContent.features, newFeature],
    });
  };

  // Feature 삭제
  const deleteFeature = (index: number) => {
    if (confirm(`Feature ${tabContent.features[index].number}를 삭제하시겠습니까?`)) {
      setTabContent({
        ...tabContent,
        features: tabContent.features.filter((_, i) => i !== index),
      });
    }
  };

  // Feature 업데이트
  const updateFeature = (index: number, field: keyof FeatureCardData, value: any) => {
    const newFeatures = [...tabContent.features];
    (newFeatures[index] as any)[field] = value;
    setTabContent({
      ...tabContent,
      features: newFeatures,
    });
  };

  // Guide Step 추가
  const addGuideStep = () => {
    const newStep: StepData = {
      number: tabContent.guide.length + 1,
      visible: true,
      title: { ko: "", en: "" },
      desc: { ko: "", en: "" },
      image: "",
    };
    setTabContent({
      ...tabContent,
      guide: [...tabContent.guide, newStep],
    });
  };

  // Guide Step 삭제
  const deleteGuideStep = (index: number) => {
    if (confirm(`Step ${tabContent.guide[index].number}를 삭제하시겠습니까?`)) {
      setTabContent({
        ...tabContent,
        guide: tabContent.guide.filter((_, i) => i !== index),
      });
    }
  };

  // Guide Step 업데이트
  const updateGuideStep = (index: number, field: keyof StepData, value: any) => {
    const newGuide = [...tabContent.guide];
    (newGuide[index] as any)[field] = value;
    setTabContent({
      ...tabContent,
      guide: newGuide,
    });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">📄 Overview 탭</TabsTrigger>
          <TabsTrigger value="features">🎯 Features 탭</TabsTrigger>
          <TabsTrigger value="guide">📋 Guide 탭</TabsTrigger>
        </TabsList>

        {/* Overview 탭 편집 */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview 제목 및 설명</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 제목 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>제목 (한국어)</Label>
                  <Input
                    value={tabContent.overview.title.ko}
                    onChange={(e) =>
                      updateOverview("title", { ...tabContent.overview.title, ko: e.target.value })
                    }
                    placeholder="Overview 제목"
                  />
                </div>
                <div>
                  <Label>Title (English)</Label>
                  <Input
                    value={tabContent.overview.title.en}
                    onChange={(e) =>
                      updateOverview("title", { ...tabContent.overview.title, en: e.target.value })
                    }
                    placeholder="Overview Title"
                  />
                </div>
              </div>

              {/* 설명 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>설명 (한국어)</Label>
                  <Textarea
                    value={tabContent.overview.desc.ko}
                    onChange={(e) =>
                      updateOverview("desc", { ...tabContent.overview.desc, ko: e.target.value })
                    }
                    placeholder="Overview 설명"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Description (English)</Label>
                  <Textarea
                    value={tabContent.overview.desc.en}
                    onChange={(e) =>
                      updateOverview("desc", { ...tabContent.overview.desc, en: e.target.value })
                    }
                    placeholder="Overview Description"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle>Overview 이미지</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 라디오 버튼: 이미지 입력 방식 */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="overview-image-input"
                    checked={tabContent.overview.imageInputMethod !== "url"}
                    onChange={() => updateOverview("imageInputMethod", "upload")}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">이미지 파일 업로드</span>
                  <span className="text-xs text-green px-2 py-0.5 bg-green/10 rounded">권장</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="overview-image-input"
                    checked={tabContent.overview.imageInputMethod === "url"}
                    onChange={() => updateOverview("imageInputMethod", "url")}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">URL 주소 입력</span>
                </label>
              </div>

              {/* 파일 업로드 모드 */}
              {tabContent.overview.imageInputMethod !== "url" && (
                <div>
                  <ImageUploader
                    pageId={pageId}
                    stepNumber={999}
                    currentImageUrl={tabContent.overview.image}
                    onUploadSuccess={(url) => updateOverview("image", url)}
                    label=""
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 권장 사이즈: <span className="font-semibold text-brand">PNG, 400×800px</span>
                  </p>
                </div>
              )}

              {/* URL 입력 모드 */}
              {tabContent.overview.imageInputMethod === "url" && (
                <div>
                  <Input
                    value={tabContent.overview.image}
                    onChange={(e) => updateOverview("image", e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">외부 이미지 URL을 입력하세요</p>
                </div>
              )}

              {/* 이미지 미리보기 */}
              {tabContent.overview.image && tabContent.overview.imageInputMethod === "url" && (
                <div>
                  <Label className="text-sm mb-2 block">미리보기</Label>
                  <img
                    src={tabContent.overview.image}
                    alt="Overview preview"
                    className="w-full max-w-md rounded-lg border border-border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features 탭 편집 */}
        <TabsContent value="features" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Feature 카드 목록</h3>
              <p className="text-sm text-muted-foreground">
                현재 {tabContent.features.length}개 Feature 카드
              </p>
            </div>
            <Button onClick={addFeature}>
              <Plus className="w-4 h-4 mr-2" />
              Feature 추가
            </Button>
          </div>

          {tabContent.features.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <p className="mb-4">아직 Feature 카드가 없습니다.</p>
                  <Button onClick={addFeature} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    첫 번째 Feature 추가
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tabContent.features.map((feature, index) => (
            <Card key={index} className={`${!feature.visible ? 'opacity-60' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>Feature {feature.number}</CardTitle>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={feature.visible}
                      onChange={(e) => updateFeature(index, 'visible', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-muted-foreground">매뉴얼에 표시</span>
                  </label>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteFeature(index)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 아이콘 */}
                <div>
                  <Label>아이콘 이모지</Label>
                  <Input
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    placeholder="🎯"
                    className="text-2xl"
                    maxLength={2}
                  />
                </div>

                {/* 제목 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>제목 (한국어)</Label>
                    <Input
                      value={feature.title.ko}
                      onChange={(e) =>
                        updateFeature(index, 'title', { ...feature.title, ko: e.target.value })
                      }
                      placeholder="Feature 제목"
                    />
                  </div>
                  <div>
                    <Label>Title (English)</Label>
                    <Input
                      value={feature.title.en}
                      onChange={(e) =>
                        updateFeature(index, 'title', { ...feature.title, en: e.target.value })
                      }
                      placeholder="Feature Title"
                    />
                  </div>
                </div>

                {/* 설명 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>설명 (한국어)</Label>
                    <Textarea
                      value={feature.desc.ko}
                      onChange={(e) =>
                        updateFeature(index, 'desc', { ...feature.desc, ko: e.target.value })
                      }
                      placeholder="Feature 설명"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Description (English)</Label>
                    <Textarea
                      value={feature.desc.en}
                      onChange={(e) =>
                        updateFeature(index, 'desc', { ...feature.desc, en: e.target.value })
                      }
                      placeholder="Feature Description"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Guide 탭 편집 */}
        <TabsContent value="guide" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Guide Step 목록</h3>
              <p className="text-sm text-muted-foreground">
                현재 {tabContent.guide.length}개 Step
              </p>
            </div>
            <Button onClick={addGuideStep}>
              <Plus className="w-4 h-4 mr-2" />
              Step 추가
            </Button>
          </div>

          {tabContent.guide.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <p className="mb-4">아직 Guide Step이 없습니다.</p>
                  <Button onClick={addGuideStep} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    첫 번째 Step 추가
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tabContent.guide.map((step, index) => (
            <Card key={index} className={`${!step.visible ? 'opacity-60' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>Step {step.number}</CardTitle>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={step.visible}
                      onChange={(e) => updateGuideStep(index, 'visible', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-muted-foreground">매뉴얼에 표시</span>
                  </label>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteGuideStep(index)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 제목 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>제목 (한국어)</Label>
                    <Input
                      value={step.title.ko}
                      onChange={(e) =>
                        updateGuideStep(index, 'title', { ...step.title, ko: e.target.value })
                      }
                      placeholder="Step 제목"
                    />
                  </div>
                  <div>
                    <Label>Title (English)</Label>
                    <Input
                      value={step.title.en}
                      onChange={(e) =>
                        updateGuideStep(index, 'title', { ...step.title, en: e.target.value })
                      }
                      placeholder="Step Title"
                    />
                  </div>
                </div>

                {/* 설명 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>설명 (한국어)</Label>
                    <Textarea
                      value={step.desc.ko}
                      onChange={(e) =>
                        updateGuideStep(index, 'desc', { ...step.desc, ko: e.target.value })
                      }
                      placeholder="Step 설명"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Description (English)</Label>
                    <Textarea
                      value={step.desc.en}
                      onChange={(e) =>
                        updateGuideStep(index, 'desc', { ...step.desc, en: e.target.value })
                      }
                      placeholder="Step Description"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Step 이미지 */}
                <div className="border border-border rounded-lg p-4 bg-muted/20">
                  <Label className="text-base font-semibold mb-3 block">Step 이미지</Label>

                  {/* 라디오 버튼: 이미지 입력 방식 */}
                  <div className="flex gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`guide-image-input-${index}`}
                        checked={step.imageInputMethod !== "url"}
                        onChange={() => updateGuideStep(index, 'imageInputMethod', 'upload')}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">이미지 파일 업로드</span>
                      <span className="text-xs text-green px-2 py-0.5 bg-green/10 rounded">권장</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`guide-image-input-${index}`}
                        checked={step.imageInputMethod === "url"}
                        onChange={() => updateGuideStep(index, 'imageInputMethod', 'url')}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">URL 주소 입력</span>
                    </label>
                  </div>

                  {/* 파일 업로드 모드 */}
                  {step.imageInputMethod !== "url" && (
                    <div>
                      <ImageUploader
                        pageId={pageId}
                        stepNumber={step.number + 100}
                        currentImageUrl={step.image}
                        onUploadSuccess={(url) => updateGuideStep(index, 'image', url)}
                        label=""
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 권장 사이즈: <span className="font-semibold text-brand">PNG, 400×800px</span>
                      </p>
                    </div>
                  )}

                  {/* URL 입력 모드 */}
                  {step.imageInputMethod === "url" && (
                    <div>
                      <Input
                        value={step.image}
                        onChange={(e) => updateGuideStep(index, 'image', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                      />
                      <p className="text-xs text-muted-foreground mt-2">외부 이미지 URL을 입력하세요</p>
                    </div>
                  )}

                  {/* 이미지 미리보기 */}
                  {step.image && step.imageInputMethod === "url" && (
                    <div className="mt-4">
                      <Label className="text-sm mb-2 block">미리보기</Label>
                      <img
                        src={step.image}
                        alt={`Step ${step.number} preview`}
                        className="w-full max-w-md rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}