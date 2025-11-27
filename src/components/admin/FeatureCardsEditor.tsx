/**
 * Feature 카드 관리 컴포넌트
 * StartFeaturesPage 레이아웃 전용
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../LanguageContext";

export interface FeatureCardData {
  number: number;
  visible: boolean;
  title: { ko: string; en: string };
  desc: { ko: string; en: string };
  icon: string;
  link?: string; // 🆕 클릭 시 이동할 페이지 ID
}

interface FeatureCardsEditorProps {
  pageId: string;
  onFeatureCardsChange: (features: FeatureCardData[]) => void;
}

export function FeatureCardsEditor({ pageId, onFeatureCardsChange }: FeatureCardsEditorProps) {
  const { t, getAllPages } = useLanguage();
  
  // 🆕 모든 페이지 목록 가져오기
  const allPages = getAllPages();
  
  // LanguageContext에서 Feature 카드 로드
  const loadFeatures = () => {
    const features: FeatureCardData[] = [];
    for (let i = 1; i <= 20; i++) { // 🔧 10 → 20으로 증가
      const titleKey = `${pageId}.feature${i}.title`;
      const title = t(titleKey) as string;
      
      if (title && title !== titleKey) {
        const visibleValue = t(`${pageId}.feature${i}.visible`);
        
        features.push({
          number: i,
          visible: visibleValue !== false, // 🔧 기본값 true (false가 아니면 true)
          title: {
            ko: title,
            en: title,
          },
          desc: {
            ko: (t(`${pageId}.feature${i}.desc`) || "") as string,
            en: (t(`${pageId}.feature${i}.desc`) || "") as string,
          },
          icon: (t(`${pageId}.feature${i}.icon`) || "🎯") as string,
          link: (t(`${pageId}.feature${i}.link`) || undefined) as string, // 🆕 링크 추가
        });
        
        console.log(`[FeatureCardsEditor] Loaded feature ${i}:`, {
          title,
          visible: visibleValue !== false,
          visibleRaw: visibleValue,
        });
      }
    }
    
    console.log('[FeatureCardsEditor] Total loaded features:', features.length, features);
    return features;
  };

  const [features, setFeatures] = useState<FeatureCardData[]>(loadFeatures);
  
  // features 변경 시 상위로 전달
  useEffect(() => {
    onFeatureCardsChange(features);
  }, [features]);

  const addFeature = () => {
    const newFeature: FeatureCardData = {
      number: features.length + 1,
      visible: true,
      title: { ko: "", en: "" },
      desc: { ko: "", en: "" },
      icon: "🎯",
    };
    setFeatures([...features, newFeature]);
  };

  const deleteFeature = (index: number) => {
    if (confirm(`Feature ${features[index].number}를 삭제하시겠습니까?`)) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const updateFeature = (index: number, field: keyof FeatureCardData, value: any) => {
    const newFeatures = [...features];
    (newFeatures[index] as any)[field] = value;
    setFeatures(newFeatures);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Feature 카드 목록</h3>
          <p className="text-sm text-muted-foreground">
            현재 {features.length}개 Feature 카드
          </p>
        </div>
        <Button onClick={addFeature}>
          <Plus className="w-4 h-4 mr-2" />
          Feature 추가
        </Button>
      </div>

      {/* Feature 카드 리스트 */}
      {features.length === 0 && (
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

      {features.map((feature, index) => (
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteFeature(index)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 아이콘 입력 */}
            <div>
              <Label>아이콘 이모지</Label>
              <Input
                value={feature.icon}
                onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                placeholder="🎯"
                className="text-2xl"
                maxLength={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                💡 이모지 1개를 입력하세요 (예: 🎯, 👥, 📊, 💬)
              </p>
            </div>

            {/* 제목 입력 */}
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

            {/* 설명 입력 */}
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

            {/* 링크 입력 */}
            <div>
              <Label>링크 (카드 클릭 시 이동할 페이지)</Label>
              <select
                value={feature.link || ""}
                onChange={(e) => updateFeature(index, 'link', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">-- 링크 없음 (카드 클릭 불가) --</option>
                {allPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    [{page.category}] {page.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                💡 카드를 클릭했을 때 이동할 페이지를 선택하세요. 링크가 없으면 카드는 클릭할 수 없습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}