# 📊 DMS 매뉴얼 백오피스 가이드

## 🎯 개요

DMS 매뉴얼 웹사이트를 GUI 기반으로 관리할 수 있는 백오피스 CMS 시스템입니다.

**기존 방식**: 개발자가 코드 파일 직접 수정 (`pages.ts`, `LanguageContext.tsx`)  
**새로운 방식**: 웹 브라우저에서 GUI로 간편하게 관리

---

## 🚀 빠른 시작

### 1. 백오피스 접속

브라우저에서 다음 URL로 접속:

```
https://your-domain.com/admin
```

### 2. 초기 설정 (최초 1회만)

백오피스에 처음 접속하면 **"초기 설정"** 탭에서 다음 단계를 완료하세요:

#### Step 1: SQL 마이그레이션 실행

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. 프로젝트의 `/supabase/migrations/001_create_tables.sql` 파일 내용을 복사
5. SQL Editor에 붙여넣고 **Run** 버튼 클릭

이 작업으로 다음 테이블이 생성됩니다:
- `categories` - 대메뉴 카테고리
- `pages` - 페이지 메타 정보
- `translations` - 다국어 번역
- `visibility` - Step/Feature 표시 여부

#### Step 2: 데이터베이스 초기화

백오피스 **"초기 설정"** 탭에서 **"초기화 실행"** 버튼 클릭

이 작업으로:
- Supabase Storage 버킷 생성
- 기본 카테고리 데이터 삽입

#### Step 3: 기존 데이터 마이그레이션 (선택사항)

기존 `pages.ts`와 `LanguageContext.tsx` 데이터를 DB로 이전하려면:

1. 브라우저 개발자 콘솔 열기 (F12)
2. 아래 코드 실행:

```javascript
// 마이그레이션 스크립트 로드 (이미 번들에 포함됨)
// 개발자 콘솔에서 실행:

// 페이지 마이그레이션
await window.migrate.pages();

// 번역 마이그레이션 (LanguageContext.tsx에서 복사)
await window.migrate.translations(
  koTranslations,  // 한국어 객체
  enTranslations   // 영어 객체
);

// Visibility 마이그레이션
await window.migrate.visibility(commonVisibility);

// 또는 한 번에:
await window.migrate.all(koTranslations, enTranslations, commonVisibility);
```

---

## 📖 기능 가이드

### 📄 페이지 관리

**경로**: 백오피스 > 페이지 관리 탭

#### 새 페이지 추가

1. **"새 페이지"** 버튼 클릭
2. 폼 입력:
   - **페이지 ID**: URL 경로 (예: `login-admin`)
   - **컴포넌트 타입**: 레이아웃 선택
     - `DefaultPage` - 기본 넘버링 레이아웃
     - `StartFeaturesPage` - 카드 그리드
     - `TabPage` - 탭 레이아웃
     - `NoticeListPage` - 아코디언
   - **카테고리**: 대메뉴 선택
   - **정렬 순서**: 카테고리 내 표시 순서
   - **첫 페이지 설정**: 대메뉴 바로가기 대상 여부
3. **"생성"** 버튼 클릭

#### 페이지 수정/삭제

- **연필 아이콘**: 페이지 수정
- **휴지통 아이콘**: 페이지 삭제

#### 드래그앤드롭 순서 변경

페이지 왼쪽의 **≡** 아이콘을 드래그하여 순서 변경 (구현 예정)

---

### 🌐 번역 관리

**경로**: 백오피스 > 번역 관리 탭

페이지별로 한국어/영어 번역을 동시에 편집할 수 있습니다.

#### 번역 키 구조

```
{page-id}.{key}
```

**예시:**
```
login-admin.title               → 페이지 제목
login-admin.intro               → 소개 텍스트
login-admin.step1.title         → Step 1 제목
login-admin.step1.desc          → Step 1 설명
login-admin.step1.image         → Step 1 이미지 URL
```

#### 번역 추가/수정

1. 페이지 선택
2. 키 입력 (예: `title`)
3. 한국어 값 입력
4. 영어 값 입력
5. **"저장"** 버튼 클릭

#### 일괄 수정

여러 번역을 한 번에 수정하고 **"일괄 저장"** 버튼 클릭

---

### 👁️ Visibility 제어

**경로**: 백오피스 > Visibility 탭

DefaultPage의 Step과 StartFeaturesPage의 Feature 카드 표시/숨김을 제어합니다.

#### Step Visibility 설정

1. 페이지 선택
2. Step 번호 선택 (1~10)
3. 토글 스위치:
   - **표시**: Step 전체 표시
   - **이미지 표시**: Step 이미지만 표시
4. 자동 저장

#### 설정 규칙

```
{page-id}.step{N}.visible         → Step 전체 표시 여부
{page-id}.step{N}.image-visible   → 이미지 표시 여부
{page-id}.feature{N}.visible      → Feature 카드 표시 여부
```

---

### 🖼️ 이미지 관리

**경로**: 백오피스 > 이미지 탭

페이지별로 언어별 이미지를 업로드/관리할 수 있습니다.

#### 이미지 업로드

1. 페이지 선택
2. 언어 선택 (한국어 / English)
3. **"파일 선택"** 버튼 클릭
4. 이미지 선택 후 **"업로드"** 버튼 클릭

#### 이미지 구조

```
page_images/
├── app-connection/
│   ├── ko.png      → 한국어 이미지
│   └── en.png      → 영어 이미지
├── login-admin/
│   ├── ko.png
│   └── en.png
```

#### 자동 URL 생성

업로드된 이미지는 자동으로 Public URL이 생성되어 번역 데이터에 저장됩니다.

---

## 🗄️ 데이터베이스 구조

### 테이블

#### 1. `categories` - 카테고리

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | TEXT | 카테고리 ID |
| name_ko | TEXT | 한국어 이름 |
| name_en | TEXT | 영어 이름 |
| icon | TEXT | 아이콘 (이모지) |
| order_num | INTEGER | 정렬 순서 |

#### 2. `pages` - 페이지

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | TEXT | 페이지 ID (Primary Key) |
| component | TEXT | 컴포넌트 타입 |
| category | TEXT | 카테고리 ID (Foreign Key) |
| order_num | INTEGER | 정렬 순서 |
| is_first_in_category | BOOLEAN | 첫 페이지 여부 |

#### 3. `translations` - 번역

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL | ID (Primary Key) |
| page_id | TEXT | 페이지 ID (Foreign Key) |
| key | TEXT | 번역 키 |
| value_ko | TEXT | 한국어 값 |
| value_en | TEXT | 영어 값 |

**Unique Constraint**: `(page_id, key)`

#### 4. `visibility` - Visibility

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL | ID (Primary Key) |
| page_id | TEXT | 페이지 ID (Foreign Key) |
| step_num | INTEGER | Step 번호 |
| is_visible | BOOLEAN | 표시 여부 |
| image_visible | BOOLEAN | 이미지 표시 여부 |

**Unique Constraint**: `(page_id, step_num)`

---

## 🔒 권한 관리

### Row Level Security (RLS)

데이터베이스에 RLS가 활성화되어 있습니다:

#### 읽기 권한
```sql
-- 모든 사용자가 읽기 가능 (Public 매뉴얼 표시용)
CREATE POLICY "Anyone can read" ON {table} FOR SELECT USING (true);
```

#### 쓰기 권한
```sql
-- 인증된 사용자만 수정 가능 (백오피스 관리자)
CREATE POLICY "Authenticated users can modify" ON {table} 
FOR ALL USING (auth.role() = 'authenticated');
```

### 백오피스 접근 제어 (추가 구현 필요)

현재 버전에서는 `/admin` URL을 아는 사람은 누구나 접근 가능합니다.

**보안 강화 방법:**

1. **Supabase Auth 통합**
   - 로그인 페이지 추가
   - 관리자 계정 생성
   - 세션 확인 후 백오피스 접근 허용

2. **이메일 화이트리스트**
   ```sql
   -- 특정 이메일만 백오피스 접근 허용
   CREATE TABLE admin_users (
     email TEXT PRIMARY KEY
   );
   
   CREATE POLICY "Only admins can modify" ON pages
   FOR ALL USING (
     auth.email() IN (SELECT email FROM admin_users)
   );
   ```

---

## 🛠️ API 엔드포인트

백오피스는 다음 API를 사용합니다:

### 페이지 API

```
GET    /admin/pages           - 모든 페이지 조회
GET    /admin/pages/:id       - 특정 페이지 조회
POST   /admin/pages           - 페이지 생성
PUT    /admin/pages/:id       - 페이지 수정
DELETE /admin/pages/:id       - 페이지 삭제
```

### 번역 API

```
GET    /admin/translations              - 모든 번역 조회
GET    /admin/translations/:pageId      - 특정 페이지 번역 조회
POST   /admin/translations              - 번역 생성/수정
POST   /admin/translations/batch        - 번역 일괄 수정
DELETE /admin/translations/:id          - 번역 삭제
```

### Visibility API

```
GET    /admin/visibility              - 모든 Visibility 조회
GET    /admin/visibility/:pageId      - 특정 페이지 Visibility 조회
POST   /admin/visibility              - Visibility 생성/수정
POST   /admin/visibility/batch        - Visibility 일괄 수정
```

### 이미지 API

```
POST   /admin/images/upload           - 이미지 업로드
DELETE /admin/images                  - 이미지 삭제
GET    /admin/images                  - 이미지 목록 조회
GET    /admin/images/:pageId          - 특정 페이지 이미지 URL 조회
```

### 통계 API

```
GET    /admin/stats                   - 대시보드 통계 조회
```

---

## 📝 워크플로우 예시

### 새 페이지 추가 전체 과정

1. **페이지 생성**
   - 백오피스 > 페이지 관리 > "새 페이지" 클릭
   - `recipe-search` 페이지 생성 (DefaultPage, recipe 카테고리)

2. **번역 추가**
   - 백오피스 > 번역 관리 > `recipe-search` 선택
   - 번역 추가:
     ```
     title       → "레시피 검색" / "Recipe Search"
     intro       → "레시피를 검색..." / "Search recipes..."
     step1.title → "검색창 사용법" / "How to use search"
     ```

3. **Visibility 설정**
   - 백오피스 > Visibility > `recipe-search` 선택
   - Step 1, 2, 3만 표시 (나머지는 숨김)

4. **이미지 업로드**
   - 백오피스 > 이미지 > `recipe-search` 선택
   - 한국어 스크린샷 업로드
   - 영어 스크린샷 업로드

5. **확인**
   - 백오피스 상단 **"매뉴얼 보기"** 버튼 클릭
   - 사이드바에서 새 페이지 확인

---

## 🐛 문제 해결

### 페이지가 표시되지 않음

- 번역 데이터가 누락되었는지 확인
- Visibility 설정에서 `visible: false`로 되어 있는지 확인
- 브라우저 콘솔에서 에러 확인

### 이미지 업로드 실패

- 파일 형식 확인 (PNG, JPG만 지원)
- 파일 크기 확인 (최대 5MB)
- Supabase Storage 버킷이 생성되었는지 확인

### 데이터베이스 초기화 실패

- SQL 마이그레이션이 먼저 실행되었는지 확인
- Supabase 대시보드에서 테이블이 생성되었는지 확인

---

## 🚀 다음 단계 (Phase 2)

현재 구현된 기능:
- ✅ 페이지 CRUD
- ✅ 카테고리 관리
- ✅ 통계 대시보드
- ✅ 초기 설정 가이드

**구현 예정** (Phase 2):
- 🔲 번역 관리 UI
- 🔲 Visibility 제어 UI
- 🔲 이미지 업로드 UI
- 🔲 드래그앤드롭 순서 변경
- 🔲 실시간 미리보기
- 🔲 로그인/권한 관리
- 🔲 변경 이력 추적

---

## 💡 참고 자료

- [Supabase 대시보드](https://supabase.com/dashboard)
- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- 프로젝트 가이드라인: `/guidelines/Guidelines.md`

---

## 🤝 문의

백오피스 사용 중 문제가 발생하면 개발자에게 문의하세요.
