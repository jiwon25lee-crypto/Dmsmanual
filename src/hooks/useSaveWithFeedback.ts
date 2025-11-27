/**
 * 저장 로직 + 로딩 상태 + 피드백을 통합한 Custom Hook
 * Admin의 모든 저장 기능에서 재사용 가능
 */

import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { toast } from 'sonner@2.0.3';

export function useSaveWithFeedback() {
  const [isSaving, setIsSaving] = useState(false);
  const { updatePageData, saveChanges } = useLanguage();

  /**
   * 페이지 데이터 저장 + 피드백
   */
  const save = async (pageId: string, data: any, successMessage?: string) => {
    setIsSaving(true);
    
    try {
      // 1. 메모리 업데이트
      updatePageData(pageId, data);
      
      // 2. Supabase에 저장
      const success = await saveChanges();
      
      if (success) {
        toast.success(successMessage || '✅ 저장되었습니다');
        return true;
      } else {
        toast.error('⚠️ 데이터베이스 저장 실패\n페이지를 새로고침하면 변경사항이 사라질 수 있습니다.');
        return false;
      }
    } catch (error) {
      console.error('[useSaveWithFeedback] Save error:', error);
      toast.error(`❌ 저장 중 오류 발생\n\n${error}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    save,
    isSaving,
  };
}
