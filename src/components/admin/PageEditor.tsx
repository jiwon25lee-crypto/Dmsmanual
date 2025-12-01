/**
 * 소메뉴 상세 페이지 편집 컴포넌트
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Save, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { ImageUploader } from "./ImageUploader";
import { FeatureCardsEditor, type FeatureCardData } from "./FeatureCardsEditor";
import { AccordionEditor, type NoticeItemData } from "./AccordionEditor";

interface PageEditorProps {
  pageId: string;
}

interface StepData {
  number: number;
  visible: boolean;
  imageVisible: boolean;
  title: { ko: string; en: string };
  desc: { ko: string; en: string };
  image: { ko: string; en: string }; // 🆕 언어별 이미지
  imageInputMethod?: "upload" | "url"; // 🆕 이미지 입력 방식
}

export function PageEditor({ pageId }: PageEditorProps) {
  const { t, language, updatePageData, getPageLayout, getTranslation, saveChanges, updateTrigger } = useLanguage();

  // 🆕 페이지 레이아웃 감지
  const pageLayout = getPageLayout(pageId);
  
  console.log('[PageEditor] Page layout:', pageLayout, 'for pageId:', pageId);

  // 실제 LanguageContext에서 데이터 로드
  const loadPageData = () => {
    const data = {
      title: {
        ko: (getTranslation(`${pageId}.title`, 'ko') || "") as string,
        en: (getTranslation(`${pageId}.title`, 'en') || "") as string,
      },
      intro: {
        ko: (getTranslation(`${pageId}.intro`, 'ko') || "") as string,
        en: (getTranslation(`${pageId}.intro`, 'en') || "") as string,
      },
      guideTitle: {
        ko: (getTranslation(`${pageId}.guide-title`, 'ko') || "") as string,
        en: (getTranslation(`${pageId}.guide-title`, 'en') || "") as string,
      },
      headerImage: {
        ko: (getTranslation(`${pageId}.header-image`, 'ko') || "") as string,
        en: (getTranslation(`${pageId}.header-image`, 'en') || "") as string,
      },
      headerImageEnabled: 
        t(`${pageId}.header-image-enabled`) === true || 
        !!(getTranslation(`${pageId}.header-image`, 'ko') as string) || 
        !!(getTranslation(`${pageId}.header-image`, 'en') as string), // ✅ 이미지 URL이 있으면 자동으로 활성화
      headerImageInputMethod: (getTranslation(`${pageId}.header-image-input-method`, 'ko') || "upload") as "upload" | "url", // ✅ translations에서 로드
      tipTitle: {
        ko: (getTranslation(`${pageId}.tip-title`, 'ko') || "") as string,
        en: (getTranslation(`${pageId}.tip-title`, 'en') || "") as string,
      },
      tipDesc: {
        ko: (getTranslation(`${pageId}.tip-desc`, 'ko') || "") as string,
        en: (getTranslation(`${pageId}.tip-desc`, 'en') || "") as string,
      },
      tipVisible: (() => {
        const value = t(`${pageId}.tip-visible`);
        // 명시적으로 false가 아니면 기본값 처리
        // boolean true, 문자열 "true", 숫자 1 등을 모두 true로 처리
        if (value === false || value === "false" || value === 0) {
          return false;
        }
        // 값이 없거나 undefined이면 false (기본값)
        if (value === undefined || value === null || value === "") {
          return false;
        }
        // 그 외의 경우 true로 간주
        return Boolean(value);
      })(),
      steps: [] as StepData[],
    };
    
    // 🆕 디버깅: 로드된 헤더 이미지 데이터 확인
    console.log('[PageEditor] Loaded header image data:', {
      headerImageEnabled: data.headerImageEnabled,
      headerImageInputMethod: data.headerImageInputMethod,
      headerImageKo: data.headerImage.ko,
      headerImageEn: data.headerImage.en,
    });

    // 🆕 디버깅: Tip 데이터 로드 확인
    const tipVisibleRaw = t(`${pageId}.tip-visible`);
    console.log('[PageEditor] ✅ Tip visible RAW value:', tipVisibleRaw, 'Type:', typeof tipVisibleRaw);
    console.log('[PageEditor] ✅ Tip visible FINAL:', data.tipVisible);
    console.log('[PageEditor] ✅ Tip title (ko):', data.tipTitle.ko);

    // Step 1~10 로드 (실제 존재하는 것만)
    for (let i = 1; i <= 10; i++) {
      const titleKey = `${pageId}.step${i}.title`;
      const titleKo = getTranslation(titleKey, 'ko') as string;
      
      // 한국어 제목이 있으면 해당 Step은 존재하는 것으로 간주
      if (titleKo) {
        data.steps.push({
          number: i,
          visible: t(`${pageId}.step${i}.visible`) === true,
          imageVisible: t(`${pageId}.step${i}.image-visible`) === true,
          title: {
            ko: titleKo,
            en: (getTranslation(titleKey, 'en') || "") as string,
          },
          desc: {
            ko: (getTranslation(`${pageId}.step${i}.desc`, 'ko') || "") as string,
            en: (getTranslation(`${pageId}.step${i}.desc`, 'en') || "") as string,
          },
          image: {
            ko: (getTranslation(`${pageId}.step${i}.image`, 'ko') || "") as string,
            en: (getTranslation(`${pageId}.step${i}.image`, 'en') || "") as string,
          },
        });
      }
    }

    return data;
  };

  // 🆕 공지사항(Notice) 로드 함수
  const loadNotices = (): NoticeItemData[] => {
    const notices: NoticeItemData[] = [];
    
    // Notice 1~20 로드 (실제 존재하는 것만)
    for (let i = 1; i <= 20; i++) {
      const titleKey = `${pageId}.notice${i}.title`;
      const titleKo = getTranslation(titleKey, 'ko') as string;
      
      // 한국어 제목이 있으면 해당 Notice는 존재하는 것으로 간주
      if (titleKo) {
        notices.push({
          number: i,
          visible: t(`${pageId}.notice${i}.visible`) !== false,
          isImportant: t(`${pageId}.notice${i}.isImportant`) === true,
          isNew: t(`${pageId}.notice${i}.isNew`) === true,
          title: {
            ko: titleKo,
            en: (getTranslation(titleKey, 'en') || "") as string,
          },
          date: {
            ko: (getTranslation(`${pageId}.notice${i}.date`, 'ko') || "") as string,
            en: (getTranslation(`${pageId}.notice${i}.date`, 'en') || "") as string,
          },
          content: {
            ko: (getTranslation(`${pageId}.notice${i}.content`, 'ko') || "") as string,
            en: (getTranslation(`${pageId}.notice${i}.content`, 'en') || "") as string,
          },
        });
      }
    }
    
    console.log('[PageEditor] Loaded notices:', notices.length, notices);
    return notices;
  };

  // 🆕 Feature 카드 로드 함수
  const loadFeatureCards = (): FeatureCardData[] => {
    const cards: FeatureCardData[] = [];
    
    // Feature 1~20 로드 (실제 존재하는 것만)
    for (let i = 1; i <= 20; i++) {
      const titleKey = `${pageId}.feature${i}.title`;
      const titleKo = getTranslation(titleKey, 'ko') as string;
      
      // 한국어 제목이 있으면 해당 Feature는 존재하는 것으로 간주
      if (titleKo) {
        cards.push({
          number: i,
          visible: t(`${pageId}.feature${i}.visible`) !== false, // 기본값 true
          icon: (getTranslation(`${pageId}.feature${i}.icon`, 'ko') || "📄") as string,
          link: (getTranslation(`${pageId}.feature${i}.link`, 'ko') || undefined) as string | undefined, // ✅ link 추가
          title: {
            ko: titleKo,
            en: (getTranslation(titleKey, 'en') || "") as string,
          },
          desc: {
            ko: (getTranslation(`${pageId}.feature${i}.desc`, 'ko') || "") as string,
            en: (getTranslation(`${pageId}.feature${i}.desc`, 'en') || "") as string,
          },
        });
      }
    }
    
    console.log('[PageEditor] Loaded feature cards:', cards.length, cards);
    return cards;
  };

  // 페이지 데이터 (LanguageContext에서 로드)
  const [pageData, setPageData] = useState(loadPageData);

  // 🆕 레이아웃에 따라 초기 activeTab 설정
  const getInitialTab = () => {
    switch (pageLayout) {
      case 'default':
        return 'basic'; // default는 기본 정보부터 시작
      case 'features':
        return 'basic'; // features도 기본 정보부터 시작
      case 'accordion':
        return 'basic'; // accordion도 기본 정보부터 시작
      default:
        return 'basic';
    }
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  // 🆕 Feature 카드 데이터 (features 레이아웃용) - 초기 로드
  const [featureCards, setFeatureCards] = useState<FeatureCardData[]>(() => {
    if (pageLayout === 'features') {
      return loadFeatureCards();
    }
    return [];
  });

  // 🆕 공지사항 데이터 (accordion 레이아웃용) - 초기 로드
  const [notices, setNotices] = useState<NoticeItemData[]>(() => {
    if (pageLayout === 'accordion') {
      return loadNotices();
    }
    return [];
  });

  console.log('[PageEditor] Loaded data for:', pageId, pageData);
  console.log('[PageEditor] Feature cards:', featureCards);
  console.log('[PageEditor] Notices:', notices);

  // ✅ LanguageContext 업데이트 감지: Supabase에서 데이터 로드 시 PageEditor 리로드
  useEffect(() => {
    console.log('[PageEditor] ========== useEffect TRIGGERED ==========');
    console.log('[PageEditor] pageId:', pageId);
    console.log('[PageEditor] updateTrigger:', updateTrigger);
    
    // 🔍 디버깅: 현재 LanguageContext의 실제 값 확인
    const testTitle = getTranslation(`${pageId}.title`, 'ko');
    console.log('[PageEditor] Current title from LanguageContext:', testTitle);
    
    // LanguageContext에서 최신 데이터 다시 로드
    const freshData = loadPageData();
    console.log('[PageEditor] freshData.title.ko:', freshData.title.ko);
    setPageData(freshData);
    
    // Feature 카드 다시 로드
    if (pageLayout === 'features') {
      const freshFeatureCards = loadFeatureCards();
      setFeatureCards(freshFeatureCards);
      console.log('[PageEditor] Reloaded feature cards:', freshFeatureCards.length);
    }
    
    // 공지사항 다시 로드
    if (pageLayout === 'accordion') {
      const freshNotices = loadNotices();
      setNotices(freshNotices);
      console.log('[PageEditor] Reloaded notices:', freshNotices.length);
    }
    
    console.log('[PageEditor] ========== Data reload COMPLETE ==========');
  }, [pageId, updateTrigger]); // ✅ pageId 또는 updateTrigger 변경 시 리로드

  const handleSave = async () => {
    console.log("Saving page data:", pageData);
    
    try {
      // 🆕 레이아웃에 따라 데이터 병합
      const dataToSave: any = { ...pageData };
      
      if (pageLayout === 'features' && featureCards.length > 0) {
        dataToSave.featureCards = featureCards;
        console.log('[PageEditor] Adding feature cards:', featureCards);
      }
      
      if (pageLayout === 'accordion' && notices.length > 0) {
        dataToSave.notices = notices;
        console.log('[PageEditor] ✅ Adding notices to save:', notices);
        console.log('[PageEditor] ✅ Notice 1 isImportant:', notices[0]?.isImportant);
        console.log('[PageEditor] ✅ Notice 1 isNew:', notices[0]?.isNew);
      }
      
      // ✅ Tip 데이터 로그 (디버깅용)
      console.log('[PageEditor] ✅ Tip data to save:', {
        tipTitle: dataToSave.tipTitle,
        tipDesc: dataToSave.tipDesc,
        tipVisible: dataToSave.tipVisible,
      });
      
      // ✅ LanguageContext 실시간 업데이트
      updatePageData(pageId, dataToSave);
      
      console.log('[PageEditor] Save completed successfully');
      
      // 🆕 Supabase에 변경 사항 저장
      console.log('[PageEditor] Saving to Supabase...');
      const success = await saveChanges();
      
      if (success) {
        alert(`✅ \"${pageData.title.ko}\" 페이지가 저장되었습니다!\\n\\n변경사항이 데이터베이스에 저장되었으며, 매뉴얼 페이지가 즉시 업데이트되었습니다.`);
      } else {
        alert(`⚠️ \"${pageData.title.ko}\" 페이지가 메모리에는 저장되었지만, 데이터베이스 저장에 실패했습니다.\\n\\n페이지를 새로고침하면 변경사항이 사라질 수 있습니다.\\n관리자 콘솔을 확인하세요.`);
      }
    } catch (error) {
      console.error('[PageEditor] Save error:', error);
      alert(`❌ 저장 중 오류가 발생했습니다.\\n\\n${error}\\n\\n관리자 콘솔을 확인하세요.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-brand">
            페이지 편집: {pageData.title.ko || pageId}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {pageId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      {/* 편집 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* 🆕 동적 탭 구성 */}
        <TabsList className={`grid w-full ${pageLayout === 'default' ? 'grid-cols-2' : 'grid-cols-2'}`}>
          <TabsTrigger value="basic">📝 기본 정보</TabsTrigger>
          
          {pageLayout === 'default' && (
            <TabsTrigger value="steps">📋 Step 관리</TabsTrigger>
          )}
          
          {pageLayout === 'features' && (
            <TabsTrigger value="features">🎯 Feature 카드 관리</TabsTrigger>
          )}
          
          {pageLayout === 'accordion' && (
            <TabsTrigger value="notices">📢 공지사항 관리</TabsTrigger>
          )}
        </TabsList>

        {/* 기본 정보 탭 */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>페이지 제목</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title-ko">한국어</Label>
                <Input
                  id="title-ko"
                  value={pageData.title.ko}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      title: { ...pageData.title, ko: e.target.value },
                    })
                  }
                  placeholder="페이지 제목 (한국어)"
                />
              </div>
              <div>
                <Label htmlFor="title-en">English</Label>
                <Input
                  id="title-en"
                  value={pageData.title.en}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      title: { ...pageData.title, en: e.target.value },
                    })
                  }
                  placeholder="Page Title (English)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>페이지 소개</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="intro-ko">한국어</Label>
                <Textarea
                  id="intro-ko"
                  value={pageData.intro.ko}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      intro: { ...pageData.intro, ko: e.target.value },
                    })
                  }
                  placeholder="페이지 소개 (한국어)"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="intro-en">English</Label>
                <Textarea
                  id="intro-en"
                  value={pageData.intro.en}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      intro: { ...pageData.intro, en: e.target.value },
                    })
                  }
                  placeholder="Page Introduction (English)"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최상단 헤더 이미지</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 🆕 라디오 버튼: 헤더 이미지 사용 여부 */}
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="header-image-enabled"
                    checked={!pageData.headerImageEnabled}
                    onChange={() => {
                      setPageData({
                        ...pageData,
                        headerImageEnabled: false,
                        headerImage: {
                          ko: "",
                          en: "",
                        },
                      });
                    }}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">사용 안 함</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                    기본
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="header-image-enabled"
                    checked={pageData.headerImageEnabled}
                    onChange={() => {
                      setPageData({
                        ...pageData,
                        headerImageEnabled: true,
                      });
                    }}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">사용함</span>
                </label>
              </div>

              {/* 헤더 이미지 사용 시 */}
              {pageData.headerImageEnabled && (
                <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    💡 한국어/영어 화면에서 다른 이미지를 표시할 수 있습니다.
                  </p>
                  
                  {/* 🆕 라디오 버튼: 이미지 입력 방식 선택 */}
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="header-image-input"
                        checked={pageData.headerImageInputMethod !== "url"}
                        onChange={() => {
                          setPageData({
                            ...pageData,
                            headerImageInputMethod: "upload",
                          });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">이미지 파일 업로드</span>
                      <span className="text-xs text-green px-2 py-0.5 bg-green/10 rounded">
                        권장
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="header-image-input"
                        checked={pageData.headerImageInputMethod === "url"}
                        onChange={() => {
                          setPageData({
                            ...pageData,
                            headerImageInputMethod: "url",
                          });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">URL 주소 입력</span>
                    </label>
                  </div>

                  {/* 🆕 2칸 그리드: 한국어 / 영어 */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* 한국어 헤더 이미지 */}
                    <div>
                      <Label className="text-sm mb-2 block">🇰🇷 한국어 헤더 이미지</Label>
                      
                      {pageData.headerImageInputMethod !== "url" && (
                        <ImageUploader
                          pageId={pageId}
                          stepNumber={0}
                          currentImageUrl={pageData.headerImage.ko}
                          onUploadSuccess={(url) => {
                            setPageData({
                              ...pageData,
                              headerImageEnabled: true, // ✅ 이미지 업로드 시 자동으로 활성화
                              headerImage: {
                                ...pageData.headerImage,
                                ko: url,
                              },
                            });
                          }}
                          label=""
                        />
                      )}
                      
                      {pageData.headerImageInputMethod === "url" && (
                        <Input
                          value={pageData.headerImage.ko}
                          onChange={(e) => {
                            setPageData({
                              ...pageData,
                              headerImage: {
                                ...pageData.headerImage,
                                ko: e.target.value,
                              },
                            });
                          }}
                          placeholder="https://..."
                        />
                      )}
                      
                      {pageData.headerImage.ko && pageData.headerImageInputMethod === "url" && (
                        <img
                          src={pageData.headerImage.ko}
                          alt="Korean header preview"
                          className="mt-2 w-full rounded border border-border"
                        />
                      )}
                    </div>

                    {/* 영어 헤더 이미지 */}
                    <div>
                      <Label className="text-sm mb-2 block">🇺🇸 English Header Image</Label>
                      
                      {pageData.headerImageInputMethod !== "url" && (
                        <ImageUploader
                          pageId={pageId}
                          stepNumber={999999}
                          currentImageUrl={pageData.headerImage.en}
                          onUploadSuccess={(url) => {
                            setPageData({
                              ...pageData,
                              headerImageEnabled: true, // ✅ 이미지 업로드 시 자동으로 활성화
                              headerImage: {
                                ...pageData.headerImage,
                                en: url,
                              },
                            });
                          }}
                          label=""
                        />
                      )}
                      
                      {pageData.headerImageInputMethod === "url" && (
                        <Input
                          value={pageData.headerImage.en}
                          onChange={(e) => {
                            setPageData({
                              ...pageData,
                              headerImage: {
                                ...pageData.headerImage,
                                en: e.target.value,
                              },
                            });
                          }}
                          placeholder="https://..."
                        />
                      )}
                      
                      {pageData.headerImage.en && pageData.headerImageInputMethod === "url" && (
                        <img
                          src={pageData.headerImage.en}
                          alt="English header preview"
                          className="mt-2 w-full rounded border border-border"
                        />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 권장 사이즈: <span className="font-semibold text-brand">PNG, 400×800px</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ Tip 영역 편집 */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Tip 영역 (하단 안내 박스)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tip 표시/숨김 */}
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pageData.tipVisible}
                    onChange={(e) => {
                      setPageData({
                        ...pageData,
                        tipVisible: e.target.checked,
                      });
                    }}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Tip 영역 표시</span>
                </label>
              </div>

              {/* Tip 제목 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tip-title-ko">제목 (한국어)</Label>
                  <Input
                    id="tip-title-ko"
                    value={pageData.tipTitle.ko}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        tipTitle: { ...pageData.tipTitle, ko: e.target.value },
                      })
                    }
                    placeholder="도움말"
                  />
                </div>
                <div>
                  <Label htmlFor="tip-title-en">Title (English)</Label>
                  <Input
                    id="tip-title-en"
                    value={pageData.tipTitle.en}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        tipTitle: { ...pageData.tipTitle, en: e.target.value },
                      })
                    }
                    placeholder="Tip"
                  />
                </div>
              </div>

              {/* Tip 설명 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tip-desc-ko">설명 (한국어)</Label>
                  <Textarea
                    id="tip-desc-ko"
                    value={pageData.tipDesc.ko}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        tipDesc: { ...pageData.tipDesc, ko: e.target.value },
                      })
                    }
                    placeholder="추가 정보나 유의사항을 입력하세요."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="tip-desc-en">Description (English)</Label>
                  <Textarea
                    id="tip-desc-en"
                    value={pageData.tipDesc.en}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        tipDesc: { ...pageData.tipDesc, en: e.target.value },
                      })
                    }
                    placeholder="Enter additional information or notes."
                    rows={3}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                💡 Tip 영역은 페이지 하단에 파란색 배경의 안내 박스로 표시됩니다.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 관리 탭 - default 레이아웃 전용 */}
        {pageLayout === 'default' && (
          <TabsContent value="steps" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Step 목록</h3>
                <p className="text-sm text-muted-foreground">
                  현재 {pageData.steps.length}개 Step
                </p>
              </div>
              <Button
                onClick={() => {
                  const newStep: StepData = {
                    number: pageData.steps.length + 1,
                    visible: false, // 🔧 기본값 false로 변경
                    imageVisible: false, // 🔧 기본값 false로 변경
                    title: { ko: "", en: "" },
                    desc: { ko: "", en: "" },
                    image: { ko: "", en: "" },
                  };
                  setPageData({
                    ...pageData,
                    steps: [...pageData.steps, newStep],
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Step 추가
              </Button>
            </div>

            {pageData.steps.map((step, index) => (
              <Card key={index} className={`${!step.visible ? 'opacity-60' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Step {step.number}</CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      {/* 👁️ Step 표시/숨김 */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={step.visible}
                          onChange={(e) => {
                            const newSteps = [...pageData.steps];
                            newSteps[index].visible = e.target.checked;
                            setPageData({ ...pageData, steps: newSteps });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-muted-foreground">매뉴얼에 표시</span>
                      </label>
                      
                      {/* 🖼️ 이미지 표시/숨김 */}
                      {step.image.ko && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={step.imageVisible}
                            onChange={(e) => {
                              const newSteps = [...pageData.steps];
                              newSteps[index].imageVisible = e.target.checked;
                              setPageData({ ...pageData, steps: newSteps });
                            }}
                            className="w-4 h-4"
                            disabled={!step.image.ko}
                          />
                          <span className="text-muted-foreground">이미지 표시</span>
                        </label>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Step ${step.number}를 삭제하시겠습니까?`)) {
                        setPageData({
                          ...pageData,
                          steps: pageData.steps.filter((_, i) => i !== index),
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Step 제목 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>제목 (한국어)</Label>
                      <Input
                        value={step.title.ko}
                        onChange={(e) => {
                          const newSteps = [...pageData.steps];
                          newSteps[index].title.ko = e.target.value;
                          setPageData({ ...pageData, steps: newSteps });
                        }}
                        placeholder="Step 제목"
                      />
                    </div>
                    <div>
                      <Label>Title (English)</Label>
                      <Input
                        value={step.title.en}
                        onChange={(e) => {
                          const newSteps = [...pageData.steps];
                          newSteps[index].title.en = e.target.value;
                          setPageData({ ...pageData, steps: newSteps });
                        }}
                        placeholder="Step Title"
                      />
                    </div>
                  </div>

                  {/* Step 설명 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>설명 (한국어)</Label>
                      <Textarea
                        value={step.desc.ko}
                        onChange={(e) => {
                          const newSteps = [...pageData.steps];
                          newSteps[index].desc.ko = e.target.value;
                          setPageData({ ...pageData, steps: newSteps });
                        }}
                        placeholder="Step 설명"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Description (English)</Label>
                      <Textarea
                        value={step.desc.en}
                        onChange={(e) => {
                          const newSteps = [...pageData.steps];
                          newSteps[index].desc.en = e.target.value;
                          setPageData({ ...pageData, steps: newSteps });
                        }}
                        placeholder="Step Description"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Step 이미지 (ko/en 분리) */}
                  <div className="border border-border rounded-lg p-4 bg-muted/20">
                    <Label className="text-base font-semibold mb-3 block">
                      📸 Step 이미지 (언어별)
                    </Label>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      💡 한국어/영어 화면에서 다른 이미지를 표시할 수 있습니다.
                    </p>
                    
                    {/* 🆕 라디오 버튼: 이미지 입력 방식 선택 */}
                    <div className="flex gap-6 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`image-input-${index}`}
                          checked={step.imageInputMethod !== "url"}
                          onChange={() => {
                            const newSteps = [...pageData.steps];
                            newSteps[index].imageInputMethod = "upload";
                            setPageData({ ...pageData, steps: newSteps });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="font-medium">이미지 파일 업로드</span>
                        <span className="text-xs text-green px-2 py-0.5 bg-green/10 rounded">
                          권장
                        </span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`image-input-${index}`}
                          checked={step.imageInputMethod === "url"}
                          onChange={() => {
                            const newSteps = [...pageData.steps];
                            newSteps[index].imageInputMethod = "url";
                            setPageData({ ...pageData, steps: newSteps });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="font-medium">URL 주소 입력</span>
                      </label>
                    </div>

                    {/* 🆕 2칸 그리드: 한국어 / 영어 */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* 한국어 이미지 */}
                      <div>
                        <Label className="text-sm mb-2 block">🇰🇷 한국어 이미지</Label>
                        
                        {step.imageInputMethod !== "url" && (
                          <ImageUploader
                            pageId={pageId}
                            stepNumber={step.number}
                            currentImageUrl={step.image.ko}
                            onUploadSuccess={(url) => {
                              const newSteps = [...pageData.steps];
                              newSteps[index].image.ko = url;
                              setPageData({ ...pageData, steps: newSteps });
                            }}
                            label=""
                          />
                        )}
                        
                        {step.imageInputMethod === "url" && (
                          <Input
                            value={step.image.ko}
                            onChange={(e) => {
                              const newSteps = [...pageData.steps];
                              newSteps[index].image.ko = e.target.value;
                              setPageData({ ...pageData, steps: newSteps });
                            }}
                            placeholder="https://..."
                          />
                        )}
                        
                        {step.image.ko && step.imageInputMethod === "url" && (
                          <img
                            src={step.image.ko}
                            alt="Korean preview"
                            className="mt-2 w-full rounded border border-border"
                          />
                        )}
                      </div>

                      {/* 영어 이미지 */}
                      <div>
                        <Label className="text-sm mb-2 block">🇺🇸 English Image</Label>
                        
                        {step.imageInputMethod !== "url" && (
                          <ImageUploader
                            pageId={pageId}
                            stepNumber={step.number * 1000 + 1}
                            currentImageUrl={step.image.en}
                            onUploadSuccess={(url) => {
                              const newSteps = [...pageData.steps];
                              newSteps[index].image.en = url;
                              setPageData({ ...pageData, steps: newSteps });
                            }}
                            label=""
                          />
                        )}
                        
                        {step.imageInputMethod === "url" && (
                          <Input
                            value={step.image.en}
                            onChange={(e) => {
                              const newSteps = [...pageData.steps];
                              newSteps[index].image.en = e.target.value;
                              setPageData({ ...pageData, steps: newSteps });
                            }}
                            placeholder="https://..."
                          />
                        )}
                        
                        {step.image.en && step.imageInputMethod === "url" && (
                          <img
                            src={step.image.en}
                            alt="English preview"
                            className="mt-2 w-full rounded border border-border"
                          />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-3">
                      💡 권장 사이즈: <span className="font-semibold text-brand">PNG, 400×800px</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}

        {/* Feature 카드 관리 탭 - features 레이아웃 전용 */}
        {pageLayout === 'features' && (
          <TabsContent value="features" className="space-y-4">
            <FeatureCardsEditor
              pageId={pageId}
              onFeatureCardsChange={(cards) => {
                setFeatureCards(cards);
              }}
            />
          </TabsContent>
        )}

        {/* 공지사항 관리 탭 - accordion 레이아웃 전용 */}
        {pageLayout === 'accordion' && (
          <TabsContent value="notices" className="space-y-4">
            <AccordionEditor
              notices={notices}
              onChange={(updatedNotices) => {
                setNotices(updatedNotices);
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}