/**
 * 빠른 시작 - 테스트 데이터 생성
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle2, Rocket, AlertCircle } from "lucide-react";
import { pagesApi, translationsApi, visibilityApi } from "../../utils/supabase/admin-client";
import { toast } from "sonner@2.0.3";

export function QuickStart() {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const createTestData = async () => {
    setLoading(true);
    
    try {
      // 1. 테스트 페이지 생성
      toast.info("테스트 페이지 생성 중...");
      
      await pagesApi.create({
        id: "test-page",
        component: "DefaultPage",
        category: "start",
        order_num: 99,
        is_first_in_category: false,
      });

      // 2. 번역 데이터 생성
      toast.info("번역 데이터 생성 중...");
      
      await translationsApi.batchUpsert([
        {
          page_id: "test-page",
          key: "title",
          value_ko: "테스트 페이지",
          value_en: "Test Page",
        },
        {
          page_id: "test-page",
          key: "intro",
          value_ko: "이것은 백오피스에서 생성된 테스트 페이지입니다.",
          value_en: "This is a test page created from the admin panel.",
        },
        {
          page_id: "test-page",
          key: "guide-title",
          value_ko: "사용 가이드",
          value_en: "User Guide",
        },
        {
          page_id: "test-page",
          key: "step1.title",
          value_ko: "첫 번째 단계",
          value_en: "First Step",
        },
        {
          page_id: "test-page",
          key: "step1.desc",
          value_ko: "이것은 첫 번째 단계의 설명입니다.",
          value_en: "This is the description of the first step.",
        },
        {
          page_id: "test-page",
          key: "step2.title",
          value_ko: "두 번째 단계",
          value_en: "Second Step",
        },
        {
          page_id: "test-page",
          key: "step2.desc",
          value_ko: "이것은 두 번째 단계의 설명입니다.",
          value_en: "This is the description of the second step.",
        },
      ]);

      // 3. Visibility 설정
      toast.info("Visibility 설정 중...");
      
      await visibilityApi.batchUpsert([
        {
          page_id: "test-page",
          step_num: 1,
          is_visible: true,
          image_visible: false,
        },
        {
          page_id: "test-page",
          step_num: 2,
          is_visible: true,
          image_visible: false,
        },
      ]);

      toast.success("테스트 데이터 생성 완료!");
      setCompleted(true);
    } catch (error) {
      console.error("Failed to create test data:", error);
      toast.error(`테스트 데이터 생성 실패: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteTestData = async () => {
    if (!confirm("테스트 데이터를 삭제하시겠습니까?")) return;

    setLoading(true);
    try {
      await pagesApi.delete("test-page");
      toast.success("테스트 데이터 삭제 완료!");
      setCompleted(false);
    } catch (error) {
      console.error("Failed to delete test data:", error);
      toast.error(`테스트 데이터 삭제 실패: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5" />
          빠른 시작 - 테스트 데이터 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            SQL 마이그레이션과 초기화가 완료된 후에 이 버튼을 사용하세요.
            백오피스 시스템이 제대로 작동하는지 테스트할 수 있습니다.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-semibold">테스트 데이터에 포함된 내용:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• 새 페이지: <code>test-page</code></li>
            <li>• 한국어/영어 번역 7개</li>
            <li>• Visibility 설정 2개 (Step 1, 2)</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={createTestData}
            disabled={loading || completed}
            className="flex-1"
          >
            {loading ? "생성 중..." : completed ? "생성 완료" : "테스트 데이터 생성"}
          </Button>

          {completed && (
            <Button
              variant="outline"
              onClick={deleteTestData}
              disabled={loading}
            >
              삭제
            </Button>
          )}
        </div>

        {completed && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              테스트 데이터가 생성되었습니다! 
              <br />
              <a
                href="/"
                className="underline font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                매뉴얼 페이지로 이동
              </a>
              하여 "DMS 시작하기" 카테고리에서 "테스트 페이지"를 확인하세요.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
