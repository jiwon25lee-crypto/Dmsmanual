/**
 * 메뉴 관리 컴포넌트
 * 대메뉴/소메뉴 구조 관리 + 드래그앤 드롭 순서 변경
 */

import { useState, useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronRight, Edit, Trash2, Plus, GripVertical, Save } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { toast } from "sonner@2.0.3";
import { 
  PAGE_CONFIGS, 
  CATEGORY_ORDER, 
  getPagesByCategory,
  type PageConfig 
} from "../../config/pages";
import { AddMenuDialog } from "./AddMenuDialog";
import { AddPageDialog } from "./AddPageDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";

interface MenuManagerProps {
  onEditPage: (pageId: string) => void;
}

interface DragItem {
  id: string;
  index: number;
}

// 드래그 가능한 카테고리 아이템
function DraggableCategory({ 
  category, 
  index, 
  isSelected, 
  onClick, 
  onEdit,
  onDelete, 
  moveCategory 
}: { 
  category: any; 
  index: number; 
  isSelected: boolean; 
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  moveCategory: (dragIndex: number, hoverIndex: number) => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'CATEGORY',
    item: { id: category.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'CATEGORY',
    hover: (item: DragItem) => {
      if (item.index !== index) {
        moveCategory(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={drop}
      className={`
        flex items-center justify-between p-3 rounded-lg border
        transition-all hover:border-brand
        ${isSelected ? "border-brand bg-green-50" : "border-border"}
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
    >
      <div 
        className="flex items-center gap-3 flex-1 cursor-pointer"
        onClick={onClick}
      >
        {/* 드래그 핸들 (GripVertical만 드래그 가능) */}
        <div
          ref={drag}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">{category.name}</p>
          <p className="text-xs text-muted-foreground">
            {category.pageCount}개 페이지
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Edit className="w-4 h-4 text-blue-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

// 드래그 가능한 페이지 아이템
function DraggablePage({ 
  page, 
  index, 
  onEdit, 
  onDelete,
  movePage 
}: { 
  page: any; 
  index: number; 
  onEdit: () => void; 
  onDelete: () => void;
  movePage: (dragIndex: number, hoverIndex: number) => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'PAGE',
    item: { id: page.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'PAGE',
    hover: (item: DragItem) => {
      if (item.index !== index) {
        movePage(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={drop}
      className={`
        flex items-center justify-between p-4 rounded-lg border border-border 
        hover:border-brand transition-all
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* 드래그 핸들 (GripVertical만 드래그 가능) */}
        <div
          ref={drag}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">{page.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ID: {page.id} | 타입: {page.component}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
        >
          <Edit className="w-4 h-4 mr-2" />
          편집
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function MenuManagerContent({ onEditPage }: MenuManagerProps) {
  const { 
    t, 
    addCategory,
    updateCategory, // 🆕 대메뉴명 수정
    addPage, 
    deleteCategory, 
    deletePage, 
    getAllCategories, 
    getPagesByCategory: getDynamicPagesByCategory,
    getPageLayout, // 🆕 레이아웃 가져오기
    reorderCategories,
    reorderPages,
    saveChanges, // 🆕 수동 저장
    getTranslation, // 🆕 특정 언어 번역 가져오기
    updateTrigger, // 🆕 업데이트 트리거 추가
  } = useLanguage();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addMenuDialogOpen, setAddMenuDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; nameKo: string; nameEn: string } | null>(null);
  const [addPageDialogOpen, setAddPageDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 🆕 변경 사항 저장 핸들러
  const handleSaveChanges = async () => {
    if (!confirm("현재 메뉴 구성을 저장하시겠습니까?")) return;
    
    setIsSaving(true);
    try {
      const success = await saveChanges();
      if (success) {
        toast.success("메뉴 구성이 성공적으로 저장되었습니다.");
      } else {
        toast.error("저장 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🆕 동적 카테고리 목록 (LanguageContext에서 가져오기)
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  
  const categories = useMemo(() => {
    console.log('[MenuManager] 🔄 Recomputing categories...', { updateTrigger });
    const allCategories = getAllCategories();
    console.log('[MenuManager] 📋 All categories:', allCategories);
    setCategoryOrder(allCategories);
    return allCategories.map((categoryId) => ({
      id: categoryId,
      name: t(`category.${categoryId}`),
      pageCount: getDynamicPagesByCategory(categoryId).length,
    }));
  }, [getAllCategories, getDynamicPagesByCategory, t, updateTrigger]); // 🆕 updateTrigger 추가

  // 선택된 카테고리의 페이지 목록
  const [pageOrder, setPageOrder] = useState<string[]>([]);
  
  // 🆕 레이아웃 타입을 한국어 이름으로 변환
  const getLayoutName = (layout: string): string => {
    const layoutNames: Record<string, string> = {
      default: "DefaultPage",
      features: "StartFeaturesPage",
      accordion: "NoticeListPage",
    };
    return layoutNames[layout] || "DefaultPage";
  };
  
  const selectedPages = useMemo(() => {
    if (!selectedCategory) return [];
    const pageIds = getDynamicPagesByCategory(selectedCategory);
    setPageOrder(pageIds);
    return pageIds.map((pageId) => {
      const layout = getPageLayout(pageId); // 🆕 실제 레이아웃 가져오기
      console.log('[MenuManager] Page:', pageId, 'Layout:', layout); // 디버깅
      return {
        id: pageId,
        title: t(`${pageId}.title`), // ✅ 실제 페이지 제목 사용
        component: getLayoutName(layout), // 🆕 레이아웃 이름으로 표시
        order: 1,
      };
    });
  }, [selectedCategory, t, getDynamicPagesByCategory, getPageLayout]);

  // 대메뉴 드래그앤 드롭
  const moveCategory = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...categoryOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setCategoryOrder(newOrder);
    reorderCategories(newOrder);
  };

  // 소메뉴 드래그앤 드롭
  const movePage = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...pageOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setPageOrder(newOrder);
    if (selectedCategory) {
      reorderPages(selectedCategory, newOrder);
    }
  };

  // 대메뉴 추가 핸들러
  const handleAddMenu = (data: { id: string; nameKo: string; nameEn: string }) => {
    addCategory(data.id, data.nameKo, data.nameEn);
    alert(`대메뉴 "${data.nameKo}"가 추가되었습니다!`);
  };

  // 소메뉴 추가 핸들러
  const handleAddPage = (data: {
    id: string;
    nameKo: string;
    nameEn: string;
    layout: any;
  }) => {
    console.log('[MenuManager] handleAddPage called with:', data);
    console.log('[MenuManager] ⚠️ Layout received:', data.layout, 'Type:', typeof data.layout);
    addPage(data.id, data.nameKo, data.nameEn, data.layout);
    alert(`소메뉴 "${data.nameKo}"가 추가되었습니다!`);
  };

  // 🆕 대메뉴명 수정 핸들러
  const handleEditCategory = (categoryId: string) => {
    const nameKo = getTranslation(`category.${categoryId}`, 'ko') as string;
    const nameEn = getTranslation(`category.${categoryId}`, 'en') as string;
    
    setEditingCategory({ id: categoryId, nameKo, nameEn });
    setEditCategoryDialogOpen(true);
  };

  // 🆕 대메뉴명 수정 완료
  const handleEditCategorySubmit = (data: { nameKo: string; nameEn: string }) => {
    if (!editingCategory) return;
    
    updateCategory(editingCategory.id, data.nameKo, data.nameEn);
    toast.success(`대메뉴 \"${data.nameKo}\"가 수정되었습니다.`);
    setEditingCategory(null);
  };

  // 🆕 대메뉴 삭제 핸들러
  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    const pageCount = getDynamicPagesByCategory(categoryId).length;
    const confirmMsg = pageCount > 0
      ? `"${categoryName}" 대메뉴와 하위 ${pageCount}개 페이지를 모두 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다!`
      : `"${categoryName}" 대메뉴를 삭제하시겠습니까?`;
    
    if (confirm(confirmMsg)) {
      deleteCategory(categoryId);
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
      }
      alert(`대메뉴 "${categoryName}"가 삭제되었습니다.`);
    }
  };

  // 🆕 소메뉴 삭제 핸들러
  const handleDeletePage = (pageId: string, pageTitle: string) => {
    if (confirm(`"${pageTitle}" 페이지를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다!`)) {
      deletePage(pageId);
      alert(`페이지 "${pageTitle}"가 삭제되었습니다.`);
    }
  };

  return (
    <>
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border border-border shadow-sm">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GripVertical className="w-5 h-5 text-brand" />
            메뉴 구조 관리
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            드래그앤 드롭으로 메뉴 순서를 변경하고, 새로운 메뉴를 추가할 수 있습니다.
            작업 후 반드시 <strong>[변경 사항 저장]</strong> 버튼을 눌러주세요.
          </p>
        </div>
        <Button 
          onClick={handleSaveChanges} 
          disabled={isSaving}
          className="bg-brand hover:bg-brand/90 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "저장 중..." : "변경 사항 저장"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 대메뉴 목록 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>📁 대메뉴</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setAddMenuDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((category, index) => (
              <DraggableCategory
                key={category.id}
                category={category}
                index={index}
                isSelected={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
                onEdit={() => handleEditCategory(category.id)}
                onDelete={() => handleDeleteCategory(category.id, category.name)}
                moveCategory={moveCategory}
              />
            ))}
          </CardContent>
        </Card>

        {/* 오른쪽: 소메뉴 목록 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                📄 소메뉴
                {selectedCategory && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({t(`category.${selectedCategory}`)})
                  </span>
                )}
              </CardTitle>
              {selectedCategory && (
                <Button variant="ghost" size="sm" onClick={() => setAddPageDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  페이지 추가
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedCategory ? (
              <div className="text-center py-12 text-muted-foreground">
                ← 왼쪽에서 대메뉴를 선택하세요
              </div>
            ) : selectedPages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                이 카테고리에 페이지가 없습니다
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPages.map((page, index) => (
                  <DraggablePage
                    key={page.id}
                    page={page}
                    index={index}
                    onEdit={() => onEditPage(page.id)}
                    onDelete={() => handleDeletePage(page.id, page.title)}
                    movePage={movePage}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 대메뉴 추가 다이얼로그 */}
      <AddMenuDialog
        open={addMenuDialogOpen}
        onOpenChange={setAddMenuDialogOpen}
        onAdd={handleAddMenu}
      />

      {/* 소메뉴 추가 다이얼로그 */}
      {selectedCategory && (
        <AddPageDialog
          open={addPageDialogOpen}
          onOpenChange={setAddPageDialogOpen}
          categoryId={selectedCategory}
          categoryName={t(`category.${selectedCategory}`) as string}
          onAdd={handleAddPage}
        />
      )}

      {/* 대메뉴명 수정 다이얼로그 */}
      {editingCategory && (
        <EditCategoryDialog
          open={editCategoryDialogOpen}
          onOpenChange={setEditCategoryDialogOpen}
          categoryId={editingCategory.id}
          currentNameKo={editingCategory.nameKo}
          currentNameEn={editingCategory.nameEn}
          onEdit={handleEditCategorySubmit}
        />
      )}
    </>
  );
}

export function MenuManager(props: MenuManagerProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <MenuManagerContent {...props} />
    </DndProvider>
  );
}