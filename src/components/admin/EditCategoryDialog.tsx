/**
 * 대메뉴명 편집 Dialog
 * - ID는 수정 불가 (읽기 전용)
 * - 한국어/영어 이름만 수정 가능
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Edit } from "lucide-react";

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  currentNameKo: string;
  currentNameEn: string;
  onEdit: (data: { nameKo: string; nameEn: string }) => void;
}

export function EditCategoryDialog({ 
  open, 
  onOpenChange, 
  categoryId,
  currentNameKo,
  currentNameEn,
  onEdit 
}: EditCategoryDialogProps) {
  const [nameKo, setNameKo] = useState(currentNameKo);
  const [nameEn, setNameEn] = useState(currentNameEn);

  // Dialog가 열릴 때마다 현재 값으로 초기화
  useEffect(() => {
    if (open) {
      setNameKo(currentNameKo);
      setNameEn(currentNameEn);
    }
  }, [open, currentNameKo, currentNameEn]);

  const handleSubmit = () => {
    if (!nameKo.trim() || !nameEn.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    onEdit({ nameKo: nameKo.trim(), nameEn: nameEn.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>✏️ 대메뉴명 수정</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* 대메뉴 ID (읽기 전용) */}
          <div className="space-y-2">
            <Label htmlFor="menu-id">대메뉴 ID (수정 불가)</Label>
            <Input
              id="menu-id"
              value={categoryId}
              disabled
              className="font-mono bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded p-2">
              ℹ️ 대메뉴 ID는 페이지 연결을 위해 변경할 수 없습니다. 이름만 수정 가능합니다.
            </p>
          </div>

          {/* 한국어 이름 */}
          <div className="space-y-2">
            <Label htmlFor="menu-name-ko">대메뉴명 (한국어)</Label>
            <Input
              id="menu-name-ko"
              placeholder="예: 회원관리"
              value={nameKo}
              onChange={(e) => setNameKo(e.target.value)}
              autoFocus
            />
          </div>

          {/* 영어 이름 */}
          <div className="space-y-2">
            <Label htmlFor="menu-name-en">대메뉴명 (English)</Label>
            <Input
              id="menu-name-en"
              placeholder="예: User Management"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit}>
            <Edit className="w-4 h-4 mr-2" />
            수정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
