/**
 * 소메뉴(페이지) 추가 Dialog
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus } from "lucide-react";
import type { PageLayout } from "../LanguageContext";

interface AddPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
  onAdd: (data: {
    id: string;
    nameKo: string;
    nameEn: string;
    layout: PageLayout;
  }) => void;
}

export function AddPageDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  onAdd,
}: AddPageDialogProps) {
  const [pageName, setPageName] = useState("");
  const [nameKo, setNameKo] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [layout, setLayout] = useState<PageLayout>("default");

  console.log('[AddPageDialog] Current layout:', layout);

  const handleSubmit = () => {
    if (!pageName || !nameKo || !nameEn) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // 페이지명 검증 (영문 소문자, 숫자, 하이픈만 허용)
    if (!/^[a-z0-9-]+$/.test(pageName)) {
      alert("페이지명은 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.");
      return;
    }

    // 전체 페이지 ID 생성 (categoryId-pageName)
    const fullPageId = `${categoryId}-${pageName}`;

    console.log('[AddPageDialog] Submitting page:', {
      id: fullPageId,
      nameKo,
      nameEn,
      layout, // ← 이 값이 정말 전달되는지 확인
    });

    onAdd({
      id: fullPageId,
      nameKo,
      nameEn,
      layout,
    });

    // 초기화
    setPageName("");
    setNameKo("");
    setNameEn("");
    setLayout("default");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            📄 소메뉴 추가
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (대메뉴: {categoryName})
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 🆕 대메뉴 ID 표시 (읽기 전용) */}
          <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
            <Label className="text-xs text-muted-foreground">대메뉴 ID (고정)</Label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-muted border border-border rounded text-sm font-mono">
                {categoryId}
              </span>
            </div>
          </div>

          {/* 🆕 소메뉴 ID 입력 */}
          <div className="space-y-2">
            <Label htmlFor="page-name">소메뉴 ID (영문 소문자, 숫자, 하이픈만)</Label>
            <Input
              id="page-name"
              placeholder="예: dashboard"
              value={pageName}
              onChange={(e) => setPageName(e.target.value.toLowerCase())}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded p-2">
              💡 <strong>전체 페이지 ID:</strong> <span className="font-mono font-semibold text-brand">{categoryId}-{pageName || "..."}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-title-ko">페이지 제목 (한국어)</Label>
            <Input
              id="page-title-ko"
              placeholder="예: 대시보드"
              value={nameKo}
              onChange={(e) => setNameKo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-title-en">페이지 제목 (English)</Label>
            <Input
              id="page-title-en"
              placeholder="예: Dashboard"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-layout">페이지 레이아웃</Label>
            <Select value={layout} onValueChange={(value) => {
              console.log('[AddPageDialog] Layout changed to:', value);
              setLayout(value as PageLayout);
            }}>
              <SelectTrigger id="page-layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">
                  <div>
                    <div className="font-medium">기본 레이아웃 (DefaultPage)</div>
                    <div className="text-xs text-muted-foreground">
                      넘버링 시스템 + Step 목록 (대부분의 매뉴얼)
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="features">
                  <div>
                    <div className="font-medium">카드 그리드 레이아웃 (StartFeaturesPage)</div>
                    <div className="text-xs text-muted-foreground">
                      Feature 카드 그리드 (주요 기능 소개)
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="tabs">
                  <div>
                    <div className="font-medium">탭 레이아웃 (TabPage)</div>
                    <div className="text-xs text-muted-foreground">
                      Overview/Features/Guide 탭
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="accordion">
                  <div>
                    <div className="font-medium">아코디언 레이아웃 (NoticeListPage)</div>
                    <div className="text-xs text-muted-foreground">
                      공지사항/FAQ 리스트
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="w-4 h-4 mr-2" />
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}