/**
 * 백오피스 대시보드
 */

import { useState } from "react";
import { Button } from "../ui/button";
import { ExternalLink, Download } from "lucide-react";
import { MenuManager } from "./MenuManager";
import { PageEditor } from "./PageEditor";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useLanguage } from "../LanguageContext";

export function AdminDashboard() {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { language } = useLanguage();

  console.log('[AdminDashboard] Rendering...', { editingPageId });
  
  // ✅ 외부 매뉴얼 링크 (환경변수 또는 현재 origin 사용)
  const manualUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://dms-guide.figma.site/';

  // 🆕 고정 텍스트 (다국어)
  const texts = {
    ko: {
      title: 'DMS 매뉴얼',
      manualLink: 'DMS 매뉴얼 바로가기',
      csvDownload: 'CSV 다운로드',
      downloading: '다운로드 중...'
    },
    en: {
      title: 'DMS Manual',
      manualLink: 'Go to DMS Manual',
      csvDownload: 'CSV Download',
      downloading: 'Downloading...'
    }
  };

  const t = texts[language] || texts.ko;

  // CSV 다운로드 핸들러
  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8aea8ee5/admin/download-csv`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('CSV 다운로드 실패');
      }

      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `dms-manual-backup-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('[AdminDashboard] CSV downloaded successfully');
    } catch (error) {
      console.error('[AdminDashboard] CSV download error:', error);
      alert('CSV 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

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
                {t.title}
              </h1>
              <Button
                variant="outline"
                onClick={() => {
                  window.open(manualUrl, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t.manualLink}
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
              {t.title}
            </h1>
            <div className="flex items-center gap-3">
              {/* CSV 다운로드 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                disabled={isDownloading}
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? t.downloading : t.csvDownload}
              </Button>
              
              {/* 매뉴얼 바로가기 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(manualUrl, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t.manualLink}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <MenuManager onEditPage={setEditingPageId} />
      </main>
    </div>
  );
}