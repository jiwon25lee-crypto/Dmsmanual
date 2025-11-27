/**
 * 진단 패널 - Supabase 동기화 상태 확인
 * 
 * 💡 이 도구는 무엇인가요?
 * - Admin에서 수정한 내용이 제대로 저장되고 있는지 확인하는 "건강검진 도구"입니다
 * - 개발 지식 없이도 시스템 상태를 한눈에 파악할 수 있습니다
 * 
 * 🔍 주요 기능:
 * 1. Supabase DB 데이터 확인: 저장소에 데이터가 제대로 있는지 체크
 * 2. 번역 키 개수: 한국어/영어 텍스트가 1:1로 매칭되는지 확인
 * 3. Visibility 키: 각 요소의 표시/숨김 설정이 있는지 확인
 * 4. 페이지 메타데이터: 각 페이지 정보가 제대로 저장되었는지 확인
 */

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RefreshCw, Database, Bug } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

export function DiagnosticPanel() {
  const { t, getTranslation } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [dbData, setDbData] = useState<any>(null);

  const checkSupabaseData = async () => {
    setLoading(true);
    try {
      console.log('[Diagnostic] Fetching data from Supabase...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8aea8ee5/manual/load`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[Diagnostic] ✅ Loaded from Supabase:', data);
        
        // Feature 키 확인
        if (data.translations?.ko) {
          const featureKeys = Object.keys(data.translations.ko).filter(k => k.includes('feature'));
          console.log('[Diagnostic] 🎯 Feature keys in DB:', featureKeys.length);
          featureKeys.forEach(key => {
            console.log(`  - ${key}: ${data.translations.ko[key]}`);
          });
        }
        
        // ✅ commonVisibility 확인
        if (data.commonVisibility) {
          const visibilityKeys = Object.keys(data.commonVisibility);
          console.log('[Diagnostic] 👁️ Visibility keys in DB:', visibilityKeys.length);
          
          // Feature visible 키만 필터링
          const featureVisibleKeys = visibilityKeys.filter(k => k.includes('feature') && k.includes('visible'));
          console.log('[Diagnostic] 🎯 Feature visible keys:', featureVisibleKeys.length);
          featureVisibleKeys.forEach(key => {
            console.log(`  - ${key}: ${data.commonVisibility[key]}`);
          });
        }
        
        setDbData(data);
        alert('✅ Supabase 데이터 로드 성공!\n\n콘솔을 확인하세요.');
      } else {
        const error = await response.text();
        console.error('[Diagnostic] ❌ Load failed:', error);
        alert('❌ 데이터 로드 실패:\n\n' + error);
      }
    } catch (error) {
      console.error('[Diagnostic] ❌ Error:', error);
      alert('❌ 오류 발생:\n\n' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <Card className="mb-6 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-yellow-600" />
            🔍 진단 도구
          </div>
          <span className="text-xs font-normal text-muted-foreground">
            시스템 건강검진
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 도구 설명 */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">
            💡 이 도구는 언제 사용하나요?
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs ml-2">
            <li>Admin에서 메뉴/페이지를 수정했는데 프론트에 반영되지 않을 때</li>
            <li>번역이 누락되었는지 확인하고 싶을 때</li>
            <li>이미지가 표시되지 않는 문제를 진단할 때</li>
            <li>정기적인 시스템 상태 점검 시</li>
          </ul>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex gap-3">
          <Button
            onClick={checkSupabaseData}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Database className="w-4 h-4 mr-2" />
            {loading ? '확인 중...' : 'DB 데이터 확인'}
          </Button>
          
          <Button
            onClick={reloadPage}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>

        {/* 버튼 설명 */}
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="font-semibold text-foreground mb-1">📊 DB 데이터 확인</div>
            <div>저장소에 데이터가 제대로 저장되어 있는지 확인합니다</div>
          </div>
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="font-semibold text-foreground mb-1">🔄 새로고침</div>
            <div>페이지를 다시 불러와서 최신 상태로 업데이트합니다</div>
          </div>
        </div>

        {dbData && (
          <div className="mt-4 p-4 bg-white rounded border border-yellow-300 space-y-3">
            <div className="font-semibold text-foreground flex items-center gap-2">
              📊 진단 결과
              <span className="text-xs font-normal text-green-600">✅ 데이터 로드 성공</span>
            </div>
            
            {/* 각 항목별 설명 포함 */}
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-blue-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-foreground">📝 한국어 텍스트</div>
                    <div className="text-xs text-muted-foreground">페이지에 표시되는 모든 한국어 텍스트 개수</div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {Object.keys(dbData.translations?.ko || {}).length}
                  </div>
                </div>
              </div>

              <div className="p-2 bg-green-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-foreground">🌐 영어 텍스트</div>
                    <div className="text-xs text-muted-foreground">페이지에 표시되는 모든 영어 텍스트 개수</div>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {Object.keys(dbData.translations?.en || {}).length}
                  </div>
                </div>
              </div>

              {/* 번역 일치 여부 체크 */}
              {Object.keys(dbData.translations?.ko || {}).length !== 
               Object.keys(dbData.translations?.en || {}).length && (
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <div className="text-xs text-red-700">
                    ⚠️ 한국어와 영어 텍스트 개수가 다릅니다. 일부 번역이 누락되었을 수 있습니다.
                  </div>
                </div>
              )}

              <div className="p-2 bg-purple-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-foreground">👁️ 표시/숨김 설정</div>
                    <div className="text-xs text-muted-foreground">각 요소(Step, 이미지 등)의 ON/OFF 스위치 개수</div>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {Object.keys(dbData.commonVisibility || {}).length}
                  </div>
                </div>
              </div>

              <div className="p-2 bg-orange-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-foreground">📄 페이지 정보</div>
                    <div className="text-xs text-muted-foreground">등록된 페이지의 설정 정보 개수</div>
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {Object.keys(dbData.pageMetadata || {}).length}
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 정보 안내 */}
            <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs text-muted-foreground">
                💡 <span className="font-semibold text-foreground">더 자세한 정보는?</span>
                <br />
                F12 키를 눌러 개발자 콘솔을 열면 각 항목의 상세 내용을 확인할 수 있습니다.
              </div>
            </div>

            {/* 문제 발견 시 안내 */}
            <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-300">
              <div className="text-xs">
                <div className="font-semibold text-foreground mb-2">🔧 문제가 발견되면?</div>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>이 화면을 스크린샷으로 캡처</li>
                  <li>개발자에게 전달: "진단 도구에서 [항목명]이 [상태]입니다"</li>
                  <li>정확한 정보 전달로 빠른 문제 해결 가능</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}