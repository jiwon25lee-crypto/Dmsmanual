import { ChevronDown, Menu, ChevronUp } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState, useEffect } from "react";
import { DefaultPage } from "./pages/DefaultPage";
import { StartFeaturesPage } from "./pages/StartFeaturesPage";
import { NoticeListPage } from "./pages/NoticeListPage";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import dmsLogo from "figma:asset/0928a451f043f11a0afa231632d62a15b387bb3c.png";

interface ManualContentProps {
  activeSection: string;
  isSidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
  onSectionChange: (sectionId: string) => void;
}

export function ManualContent({
  activeSection,
  onMobileMenuToggle,
  onSectionChange,
}: ManualContentProps) {
  const { language, setLanguage, t, getPageLayout } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 🆕 실시간 업데이트 감지
  useEffect(() => {
    const handleTranslationsUpdate = (event: any) => {
      console.log('[ManualContent] Translations updated:', event.detail);
      // 컴포넌트 리렌더링 트리거
      setRefreshKey(prev => prev + 1);
    };

    const handlePageDataUpdate = (event: any) => {
      console.log('[ManualContent] Page data updated:', event.detail);
      // 컴포넌트 리렌더링 트리거
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('translations-updated', handleTranslationsUpdate);
    window.addEventListener('page-data-updated', handlePageDataUpdate);

    return () => {
      window.removeEventListener('translations-updated', handleTranslationsUpdate);
      window.removeEventListener('page-data-updated', handlePageDataUpdate);
    };
  }, []);

  // Scroll to top functionality
  useEffect(() => {
    const mainElement = document.querySelector("main");

    const handleScroll = () => {
      if (mainElement) {
        setShowScrollTop(mainElement.scrollTop > 300);
      }
    };

    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
      return () =>
        mainElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderContent = () => {
    // 🆕 동적 페이지 레이아웃 조회
    const layout = getPageLayout(activeSection);
    
    console.log('[ManualContent] Rendering page:', { activeSection, layout });

    // 레이아웃에 따라 자동 라우팅 (refreshKey로 강제 리렌더링)
    switch (layout) {
      case "features":
        return <StartFeaturesPage key={`features-${activeSection}-${refreshKey}`} pageId={activeSection} onSectionChange={onSectionChange} />;
      case "accordion":
        return <NoticeListPage key={`notice-${activeSection}-${refreshKey}`} pageId={activeSection} />;
      case "default":
      default:
        return <DefaultPage key={`${activeSection}-${refreshKey}`} pageId={activeSection} />;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border flex items-center justify-between px-4 z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <ImageWithFallback
          src={dmsLogo}
          alt="Diet Monitoring Solution"
          className="h-10 w-auto object-contain max-w-[200px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 px-2"
            >
              <span className="text-foreground text-sm">
                {language === "ko" ? "한국어" : "EN"}
              </span>
              <ChevronDown className="w-3 h-3 text-foreground opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage("ko")}>
              한국어
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")}>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Language Selector - Top Right */}
      <div className="hidden lg:block fixed top-6 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-1 px-3 bg-card border border-border hover:bg-accent"
            >
              <span className="text-foreground">
                {language === "ko" ? "한국어" : "English"}
              </span>
              <ChevronDown className="w-4 h-4 text-foreground opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage("ko")}>
              한국어
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")}>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 sm:pt-8 lg:pt-12 pb-16 sm:pb-20 lg:pb-24 mt-16 lg:mt-0">
        {renderContent()}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <div className="fixed bottom-4 right-4 flex gap-6">
          <Button
            variant="default"
            className="bg-brand hover:bg-brand/90 border border-border effect-shadow-sm rounded-[42px] transition-all duration-300 text-white"
            onClick={() =>
              window.open(
                "https://admin.dms.doinglab.com/auth/login",
                "_blank",
              )
            }
          >
            <span>DMS 무료 체험</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white hover:bg-[#f5f5f5] border border-border effect-shadow-sm rounded-[42px] transition-all duration-300"
            onClick={scrollToTop}
          >
            <ChevronUp className="w-5 h-5 text-foreground" />
          </Button>
        </div>
      )}
    </main>
  );
}