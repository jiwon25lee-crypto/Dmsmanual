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
  const [isCleaning, setIsCleaning] = useState(false);
  const { language, cleanupOrphanedData, getAllPages } = useLanguage();

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
      downloading: '다운로드 중...',
      cleanupData: '데이터 정리',
      cleaning: '정리 중...'
    },
    en: {
      title: 'DMS Manual',
      manualLink: 'Go to DMS Manual',
      csvDownload: 'CSV Download',
      downloading: 'Downloading...',
      cleanupData: 'Cleanup Data',
      cleaning: 'Cleaning...'
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
      return true;
    } catch (error) {
      console.error('[AdminDashboard] CSV download error:', error);
      alert('CSV 다운로드 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  // 🆕 데이터 정리 핸들러
  const handleCleanupData = async () => {
    try {
      // 1차 컨펌 - 백업 권장
      const confirmBackup = window.confirm(
        '⚠️ Admin 데이터와 서버 데이터를 동기화하시겠습니까?\n\n' +
        'Admin에서 제거한 데이터가 완전히 삭제되며 복구할 수 없습니다.\n\n' +
        '계속하기 전에 CSV 백업을 다운로드하시겠습니까?\n' +
        '(강력 권장)'
      );
      
      if (!confirmBackup) {
        return;
      }
      
      // CSV 백업 다운로드
      console.log('[AdminDashboard] Downloading backup before cleanup...');
      const downloadSuccess = await handleDownloadCSV();
      
      if (!downloadSuccess) {
        alert('백업 다운로드에 실패했습니다. 데이터 정리를 중단합니다.');
        return;
      }
      
      // 2차 컨펌 - 최종 확인
      const confirmCleanup = window.confirm(
        '🚨 최종 확인\n\n' +
        'CSV 백업이 완료되었습니다.\n\n' +
        '이제 Admin 메뉴에 없는 모든 페이지 데이터가 서버에서 영구 삭제됩니다.\n' +
        '⚠️ 이 작업은 되돌릴 수 없습니다.\n\n' +
        '정말로 데이터를 정리하시겠습니까?'
      );
      
      if (!confirmCleanup) {
        return;
      }
      
      // 데이터 정리 실행
      setIsCleaning(true);
      console.log('[AdminDashboard] Starting data cleanup...');
      
      const result = await cleanupOrphanedData();
      
      console.log('[AdminDashboard] Cleanup completed:', result);
      
      alert(
        `✅ 데이터 정리 완료\n\n` +
        `삭제된 페이지: ${result.orphanedCount}개\n` +
        `삭제된 이미지: ${result.imageCount}개\n\n` +
        `서버 데이터가 Admin과 완전히 동기화되었습니다.`
      );
      
      // 페이지 새로고침으로 UI 갱신
      window.location.reload();
    } catch (error) {
      console.error('[AdminDashboard] Cleanup error:', error);
      alert('데이터 정리 중 오류가 발생했습니다.\n\n' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsCleaning(false);
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
              {/* 🆕 데이터 정리 버튼 */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCleanupData}
                disabled={isCleaning || isDownloading}
              >
                ⚠️ {isCleaning ? t.cleaning : t.cleanupData}
              </Button>
              
              {/* CSV 다운로드 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                disabled={isDownloading || isCleaning}
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