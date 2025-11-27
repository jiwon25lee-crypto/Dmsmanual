/**
 * 페이지 관리 컴포넌트
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { pagesApi, categoriesApi, type Page, type Category } from "../../utils/supabase/admin-client";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function PageManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    id: "",
    component: "DefaultPage",
    category: "",
    order_num: 1,
    is_first_in_category: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pagesData, categoriesData] = await Promise.all([
        pagesApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setPages(pagesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.id || !formData.category) {
        toast.error("필수 항목을 입력하세요");
        return;
      }

      await pagesApi.create(formData);
      toast.success("페이지가 생성되었습니다");
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Create page error:", error);
      toast.error("페이지 생성 실패");
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editingPage) return;

      await pagesApi.update(editingPage.id, formData);
      toast.success("페이지가 수정되었습니다");
      setIsDialogOpen(false);
      setEditingPage(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Update page error:", error);
      toast.error("페이지 수정 실패");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 페이지를 삭제하시겠습니까?")) return;

    try {
      await pagesApi.delete(id);
      toast.success("페이지가 삭제되었습니다");
      loadData();
    } catch (error) {
      console.error("Delete page error:", error);
      toast.error("페이지 삭제 실패");
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingPage(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (page: Page) => {
    setFormData({
      id: page.id,
      component: page.component,
      category: page.category,
      order_num: page.order_num,
      is_first_in_category: page.is_first_in_category,
    });
    setEditingPage(page);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      component: "DefaultPage",
      category: "",
      order_num: 1,
      is_first_in_category: false,
    });
  };

  // 카테고리별 그룹핑
  const pagesByCategory = pages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, Page[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">페이지 관리</h2>
          <p className="text-muted-foreground mt-1">
            매뉴얼 페이지를 추가, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              새 페이지
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? "페이지 수정" : "새 페이지 생성"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="page-id">페이지 ID</Label>
                <Input
                  id="page-id"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })}
                  placeholder="login-admin"
                  disabled={!!editingPage}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="component">컴포넌트 타입</Label>
                <Select
                  value={formData.component}
                  onValueChange={(value) =>
                    setFormData({ ...formData, component: value })}
                >
                  <SelectTrigger id="component">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DefaultPage">DefaultPage</SelectItem>
                    <SelectItem value="StartFeaturesPage">
                      StartFeaturesPage
                    </SelectItem>
                    <SelectItem value="NoticeListPage">
                      NoticeListPage
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name_ko}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">정렬 순서</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order_num}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order_num: parseInt(e.target.value),
                    })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="first-page"
                  checked={formData.is_first_in_category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_first_in_category: e.target.checked,
                    })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="first-page">
                  카테고리의 첫 페이지로 설정
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                취소
              </Button>
              <Button onClick={editingPage ? handleUpdate : handleCreate}>
                {editingPage ? "수정" : "생성"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 페이지 목록 (카테고리별) */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryPages = pagesByCategory[category.id] || [];
          if (categoryPages.length === 0) return null;

          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.name_ko}</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    ({categoryPages.length}개)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryPages
                    .sort((a, b) => a.order_num - b.order_num)
                    .map((page) => (
                      <div
                        key={page.id}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{page.id}</span>
                            {page.is_first_in_category && (
                              <span className="text-xs bg-brand text-white px-2 py-0.5 rounded">
                                첫 페이지
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {page.component} · 순서: {page.order_num}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(page)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(page.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
