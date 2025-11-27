/**
 * 대메뉴 추가 Dialog
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus } from "lucide-react";

interface AddMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { id: string; nameKo: string; nameEn: string }) => void;
}

export function AddMenuDialog({ open, onOpenChange, onAdd }: AddMenuDialogProps) {
  const [id, setId] = useState("");
  const [nameKo, setNameKo] = useState("");
  const [nameEn, setNameEn] = useState("");

  const handleSubmit = () => {
    if (!id || !nameKo || !nameEn) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // ID 검증 (영문 소문자, 숫자, 하이픈만 허용)
    if (!/^[a-z0-9-]+$/.test(id)) {
      alert("ID는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.");
      return;
    }

    onAdd({ id, nameKo, nameEn });
    
    // 초기화
    setId("");
    setNameKo("");
    setNameEn("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>📁 대메뉴 추가</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="menu-id">대메뉴 ID (영문 소문자, 숫자, 하이픈만)</Label>
            <Input
              id="menu-id"
              placeholder="예: user-management"
              value={id}
              onChange={(e) => setId(e.target.value.toLowerCase())}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground bg-yellow/10 border border-yellow rounded p-2">
              ⚠️ 대메뉴 ID는 이후 소메뉴 추가 시 <span className="font-mono font-semibold">{id || "..."}-소메뉴ID</span> 형태로 사용됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-name-ko">대메뉴명 (한국어)</Label>
            <Input
              id="menu-name-ko"
              placeholder="예: 회원관리"
              value={nameKo}
              onChange={(e) => setNameKo(e.target.value)}
            />
          </div>

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
            <Plus className="w-4 h-4 mr-2" />
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}