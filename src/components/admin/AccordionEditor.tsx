/**
 * 아코디언(공지사항) 편집 컴포넌트
 */

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus, Trash2 } from "lucide-react";

export interface NoticeItemData {
  number: number;
  visible: boolean;
  isImportant: boolean;
  isNew: boolean;
  title: { ko: string; en: string };
  date: { ko: string; en: string };
  content: { ko: string; en: string };
}

interface AccordionEditorProps {
  notices: NoticeItemData[];
  onChange: (notices: NoticeItemData[]) => void;
}

export function AccordionEditor({ notices, onChange }: AccordionEditorProps) {
  const addNotice = () => {
    const newNumber = notices.length > 0 
      ? Math.max(...notices.map(n => n.number)) + 1 
      : 1;
    
    const newNotice: NoticeItemData = {
      number: newNumber,
      visible: true,
      isImportant: false,
      isNew: false,
      title: { ko: "", en: "" },
      date: { ko: "", en: "" },
      content: { ko: "", en: "" },
    };
    
    onChange([...notices, newNotice]);
  };

  const deleteNotice = (index: number) => {
    if (confirm(`Notice ${notices[index].number}를 삭제하시겠습니까?`)) {
      onChange(notices.filter((_, i) => i !== index));
    }
  };

  const updateNotice = (index: number, field: keyof NoticeItemData, value: any) => {
    const updated = [...notices];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* 추가 버튼 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">공지사항 목록</h3>
          <p className="text-sm text-muted-foreground">
            {notices.length}개의 공지사항
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addNotice}>
          <Plus className="w-4 h-4 mr-2" />
          공지사항 추가
        </Button>
      </div>

      {/* 공지사항 리스트 */}
      {notices.map((notice, index) => (
        <Card key={index} className={`${!notice.visible ? 'opacity-60' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Notice {notice.number}</CardTitle>
              <div className="flex items-center gap-4 text-sm">
                {/* 표시/숨김 */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notice.visible}
                    onChange={(e) => updateNotice(index, 'visible', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-muted-foreground">매뉴얼에 표시</span>
                </label>
                
                {/* 중요 배지 */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notice.isImportant}
                    onChange={(e) => updateNotice(index, 'isImportant', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-red-500">🔴 중요</span>
                </label>
                
                {/* 신규 배지 */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notice.isNew}
                    onChange={(e) => updateNotice(index, 'isNew', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-brand">🟢 신규</span>
                </label>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteNotice(index)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 제목 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>제목 (한국어)</Label>
                <Input
                  value={notice.title.ko}
                  onChange={(e) => updateNotice(index, 'title', { ...notice.title, ko: e.target.value })}
                  placeholder="공지사항 제목"
                />
              </div>
              <div>
                <Label>Title (English)</Label>
                <Input
                  value={notice.title.en}
                  onChange={(e) => updateNotice(index, 'title', { ...notice.title, en: e.target.value })}
                  placeholder="Notice Title"
                />
              </div>
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>날짜 (한국어)</Label>
                <Input
                  type="text"
                  value={notice.date.ko}
                  onChange={(e) => updateNotice(index, 'date', { ...notice.date, ko: e.target.value })}
                  placeholder="2024.01.01"
                />
              </div>
              <div>
                <Label>Date (English)</Label>
                <Input
                  type="text"
                  value={notice.date.en}
                  onChange={(e) => updateNotice(index, 'date', { ...notice.date, en: e.target.value })}
                  placeholder="2024.01.01"
                />
              </div>
            </div>

            {/* 내용 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>내용 (한국어)</Label>
                <Textarea
                  value={notice.content.ko}
                  onChange={(e) => updateNotice(index, 'content', { ...notice.content, ko: e.target.value })}
                  placeholder="공지사항 내용을 입력하세요."
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  줄바꿈은 Enter로 입력하세요.
                </p>
              </div>
              <div>
                <Label>Content (English)</Label>
                <Textarea
                  value={notice.content.en}
                  onChange={(e) => updateNotice(index, 'content', { ...notice.content, en: e.target.value })}
                  placeholder="Enter notice content."
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use Enter for line breaks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {notices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          <p>공지사항이 없습니다.</p>
          <p className="text-sm mt-2">위의 "공지사항 추가" 버튼을 클릭하여 추가하세요.</p>
        </div>
      )}
    </div>
  );
}
