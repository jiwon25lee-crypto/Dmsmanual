/**
 * 초기 설정 가이드
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle2, Circle, AlertCircle, ExternalLink, Copy } from "lucide-react";
import { initializeApi } from "../../utils/supabase/admin-client";
import { toast } from "sonner@2.0.3";
import { DebugInfo } from "./DebugInfo";

// SQL 마이그레이션 스크립트
const SQL_MIGRATION = `-- DMS 매뉴얼 백오피스 데이터베이스 스키마

-- 1. 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 페이지 테이블
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  component TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL,
  is_first_in_category BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 번역 테이블
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value_ko TEXT,
  value_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_id, key)
);

-- 4. Visibility 테이블
CREATE TABLE IF NOT EXISTS visibility (
  id SERIAL PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  step_num INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  image_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_id, step_num)
);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_pages_category ON pages(category);
CREATE INDEX IF NOT EXISTS idx_pages_order ON pages(order_num);
CREATE INDEX IF NOT EXISTS idx_translations_page_id ON translations(page_id);
CREATE INDEX IF NOT EXISTS idx_visibility_page_id ON visibility(page_id);

-- 6. 업데이트 타임스탬프 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 트리거 설정
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translations_updated_at ON translations;
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_visibility_updated_at ON visibility;
CREATE TRIGGER update_visibility_updated_at
  BEFORE UPDATE ON visibility
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. RLS (Row Level Security) 설정
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE visibility ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Anyone can read pages" ON pages;
DROP POLICY IF EXISTS "Anyone can read translations" ON translations;
DROP POLICY IF EXISTS "Anyone can read visibility" ON visibility;
DROP POLICY IF EXISTS "Service role can modify categories" ON categories;
DROP POLICY IF EXISTS "Service role can modify pages" ON pages;
DROP POLICY IF EXISTS "Service role can modify translations" ON translations;
DROP POLICY IF EXISTS "Service role can modify visibility" ON visibility;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read pages" ON pages FOR SELECT USING (true);
CREATE POLICY "Anyone can read translations" ON translations FOR SELECT USING (true);
CREATE POLICY "Anyone can read visibility" ON visibility FOR SELECT USING (true);

-- Service role만 수정 가능
CREATE POLICY "Service role can modify categories" ON categories FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can modify pages" ON pages FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can modify translations" ON translations FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can modify visibility" ON visibility FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- 9. 초기 카테고리 데이터 삽입
INSERT INTO categories (id, name_ko, name_en, icon, order_num) VALUES
  ('start', 'DMS 시작하기', 'Getting Started', '🚀', 1),
  ('login', 'DMS 로그인/회원가입', 'Login & Sign Up', '🔐', 2),
  ('app', 'DMS-상식플러스(App)', 'DMS App', '📱', 3),
  ('member', '회원 관리', 'Member Management', '👥', 4),
  ('recipe', '레시피 관리', 'Recipe Management', '🍽️', 5),
  ('settings', '설정', 'Settings', '⚙️', 6),
  ('notice', '서비스 공지사항', 'Service Notices', '📢', 7)
ON CONFLICT (id) DO NOTHING;`;

interface Step {
  id: string;
  title: string;
  description: string;
  action?: () => Promise<void>;
  actionLabel?: string;
  completed: boolean;
}

export function SetupGuide() {
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "sql",
      title: "1. SQL 마이그레이션 실행",
      description:
        "Supabase 대시보드의 SQL Editor에서 아래 SQL을 복사하여 실행하세요.",
      completed: false,
    },
    {
      id: "init",
      title: "2. 데이터베이스 초기화",
      description:
        "스토리지 버킷을 생성하고 데이터베이스를 준비합니다.",
      action: async () => {
        await initializeApi.run();
      },
      actionLabel: "초기화 실행",
      completed: false,
    },
  ]);

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(SQL_MIGRATION);
      toast.success("SQL이 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("Failed to copy SQL:", error);
      toast.error("복사 실패. SQL을 수동으로 선택하여 복사하세요.");
    }
  };

  const handleStepAction = async (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step || !step.action) return;

    setLoading(true);
    try {
      await step.action();
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId ? { ...s, completed: true } : s
        )
      );
      toast.success(`${step.title} 완료!`);
    } catch (error) {
      console.error(`Step ${stepId} failed:`, error);
      toast.error(`${step.title} 실패: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompleted = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, completed: !s.completed } : s
      )
    );
  };

  const allCompleted = steps.every((s) => s.completed);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🚀 백오피스 초기 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              백오피스를 처음 사용하기 전에 아래 단계를 완료하세요.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStepCompleted(step.id)}
                    className="mt-0.5"
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    
                    {step.id === "sql" && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={copySql}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            SQL 복사
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a
                              href="https://supabase.com/dashboard"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Supabase 열기
                            </a>
                          </Button>
                        </div>
                        <div className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-48">
                          <pre>{SQL_MIGRATION.substring(0, 500)}...</pre>
                        </div>
                      </div>
                    )}
                    
                    {step.action && (
                      <Button
                        size="sm"
                        onClick={() => handleStepAction(step.id)}
                        disabled={loading || step.completed}
                      >
                        {step.actionLabel || "실행"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {allCompleted && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                모든 설정이 완료되었습니다! 아래 "빠른 시작" 카드에서 테스트 데이터를 생성하세요.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <DebugInfo />
    </div>
  );
}