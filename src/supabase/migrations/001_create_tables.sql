-- ========================================
-- DMS 매뉴얼 백오피스 데이터베이스 스키마
-- ========================================

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
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visibility_updated_at
  BEFORE UPDATE ON visibility
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. RLS (Row Level Security) 설정
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE visibility ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read pages" ON pages FOR SELECT USING (true);
CREATE POLICY "Anyone can read translations" ON translations FOR SELECT USING (true);
CREATE POLICY "Anyone can read visibility" ON visibility FOR SELECT USING (true);

-- 인증된 사용자만 수정 가능 (관리자만 백오피스 접근 가정)
CREATE POLICY "Authenticated users can modify categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can modify pages" ON pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can modify translations" ON translations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can modify visibility" ON visibility FOR ALL USING (auth.role() = 'authenticated');

-- 9. 초기 카테고리 데이터 삽입
INSERT INTO categories (id, name_ko, name_en, icon, order_num) VALUES
  ('start', 'DMS 시작하기', 'Getting Started', '🚀', 1),
  ('login', 'DMS 로그인/회원가입', 'Login & Sign Up', '🔐', 2),
  ('app', 'DMS-상식플러스(App)', 'DMS App', '📱', 3),
  ('member', '회원 관리', 'Member Management', '👥', 4),
  ('recipe', '레시피 관리', 'Recipe Management', '🍽️', 5),
  ('settings', '설정', 'Settings', '⚙️', 6),
  ('notice', '서비스 공지사항', 'Service Notices', '📢', 7)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE categories IS '대메뉴 카테고리';
COMMENT ON TABLE pages IS '페이지 메타 정보';
COMMENT ON TABLE translations IS '다국어 번역 데이터';
COMMENT ON TABLE visibility IS 'Step/Feature 표시 여부';
