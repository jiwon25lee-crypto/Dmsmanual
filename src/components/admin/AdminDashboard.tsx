/**
 * 백오피스 대시보드
 */

import { useState } from "react";
import { Button } from "../ui/button";
import { ExternalLink } from "lucide-react";
import { MenuManager } from "./MenuManager";
import { PageEditor } from "./PageEditor";

export function AdminDashboard() {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  console.log('[AdminDashboard] Rendering...', { editingPageId });

  // 페이지 편집 모드
  if (editingPageId) {
    console.log('[AdminDashboard] Edit mode for:', editingPageId);
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 
                className="text-brand cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setEditingPageId(null)}
              >
                DMS 매뉴얼 관리
              </h1>
              <Button
                variant="outline"
                onClick={() => {
                  window.open('https://dms-guide.figma.site/', '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                DMS 매뉴얼 바로가기
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <PageEditor pageId={editingPageId} />
        </main>
      </div>
    );
  }

  console.log('[AdminDashboard] Normal mode - showing MenuManager');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-brand">
              DMS 매뉴얼 관리
            </h1>
            <Button
              variant="outline"
              onClick={() => {
                window.open('https://dms-guide.figma.site/', '_blank');
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              DMS 매뉴얼 바로가기
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <MenuManager onEditPage={setEditingPageId} />
      </main>
    </div>
  );
}
