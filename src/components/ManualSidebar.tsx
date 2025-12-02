import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { useLanguage } from "./LanguageContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoImage from "figma:asset/da0688ccbe51266744695e3d5c08e8ab99f2e8e7.png";

interface Category {
  id: string;
  title: string;
  sections: { id: string; title: string }[];
}

interface ManualSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function ManualSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileToggle,
  activeSection,
  onSectionChange,
}: ManualSidebarProps) {
  const { t, getAllCategories, getPagesByCategory, language } = useLanguage();
  const [expandedCategories, setExpandedCategories] = useState<
    string[]
  >(["start", "notice"]);

  const toggleCategory = (categoryId: string) => {
    // 🆕 대메뉴 클릭 시 첫 번째 소메뉴로 이동
    const pageIds = getPagesByCategory(categoryId);
    if (pageIds.length > 0) {
      onSectionChange(pageIds[0]); // 첫 번째 소메뉴 활성화
    }
    
    // 기존 확장/축소 로직 유지
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const categories: Category[] = useMemo(() => {
    const allCategories = getAllCategories();
    return allCategories.map((categoryId) => {
      const pageIds = getPagesByCategory(categoryId);
      return {
        id: categoryId,
        title: t(`category.${categoryId}`),
        sections: pageIds.map((pageId) => {
          // section 번역 키 매핑: section.{category}.{pageName}
          const pageName = pageId.replace(`${categoryId}-`, "");
          const sectionKey = `section.${categoryId}.${pageName}`;
          return {
            id: pageId,
            title: t(sectionKey),
          };
        }),
      };
    });
  }, [t, getAllCategories, getPagesByCategory]);

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div
        className="h-16 border-b border-sidebar-border flex items-center justify-between px-4"
        style={{ fontFamily: "var(--font-family)" }}
      >
        {/* Logo and Title - vertical layout */}
        {!isCollapsed && (
          <div className="flex flex-col items-start gap-1 flex-1">
            {/* Logo - top */}
            <ImageWithFallback
              src={logoImage}
              alt="Logo"
              className="h-3 w-auto flex-shrink-0"
            />
            {/* Title - bottom */}
            <h2
              style={{
                letterSpacing: "-0.01em",
              }}
            >
              {language === "ko" ? "DMS 매뉴얼" : "DMS Manual"}
            </h2>
          </div>
        )}

        {/* Collapsed state - no logo, just empty space */}
        {isCollapsed && <div className="flex-1"></div>}

        {/* Toggle Button - Desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="flex-shrink-0 hidden lg:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>

        {/* Close Button - Mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileToggle}
          className="flex-shrink-0 lg:hidden"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{ fontFamily: "var(--font-family)" }}
      >
        {categories.map((category) => (
          <div key={category.id} className="mb-2">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              style={{ fontFamily: "var(--font-family)" }}
            >
              <div className="flex items-center gap-3">
                {!isCollapsed && (
                  <span
                    className="text-sidebar-foreground"
                    style={{
                      fontWeight: 600,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {category.title}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <div className="text-sidebar-foreground opacity-50">
                  {expandedCategories.includes(category.id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>

            {/* Sections */}
            {!isCollapsed &&
              expandedCategories.includes(category.id) && (
                <div className="ml-4 mt-1 space-y-1">
                  {category.sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() =>
                        onSectionChange(section.id)
                      }
                      className={`w-full text-left px-3 py-2 rounded-[46px] transition-all duration-300 ${
                        activeSection === section.id
                          ? "bg-brand text-white"
                          : "text-sidebar-foreground opacity-80 hover:bg-[#c2c2b8]"
                      }`}
                      style={
                        activeSection === section.id
                          ? {
                              backgroundColor: "var(--brand)",
                              color: "var(--white)",
                            }
                          : undefined
                      }
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-16" : "w-80"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden lg:flex flex-col effect-shadow-sm`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}