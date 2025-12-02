# 📘 Supabase SQL 스크립트 실행 가이드

## 🎯 목적
`supabase_insert_manual_data.sql` 파일을 Supabase에 직접 실행하여 DMS 매뉴얼 데이터를 저장합니다.

---

## 📋 실행 순서

### **Step 1: Supabase Dashboard 접속**

1. 브라우저에서 [https://supabase.com/dashboard](https://supabase.com/dashboard) 접속
2. 해당 프로젝트 선택

---

### **Step 2: SQL Editor 열기**

1. 좌측 메뉴에서 **"SQL Editor"** 클릭
2. 또는 좌측 메뉴 하단의 **"Database" > "SQL Editor"** 선택

---

### **Step 3: SQL 스크립트 실행**

#### **방법 1: 직접 복사-붙여넣기** (권장)

1. `supabase_insert_manual_data.sql` 파일 열기
2. **전체 내용 복사** (Ctrl+A → Ctrl+C)
3. Supabase SQL Editor의 입력창에 **붙여넣기** (Ctrl+V)
4. 우측 하단의 **"Run"** 버튼 클릭 ▶️

#### **방법 2: 파일 업로드** (지원되는 경우)

1. SQL Editor 상단의 파일 업로드 버튼 클릭
2. `supabase_insert_manual_data.sql` 선택
3. **"Run"** 버튼 클릭

---

### **Step 4: 실행 결과 확인**

#### ✅ **성공 시:**
```
Success. No rows returned
```
또는
```
1 row affected
```

#### ❌ **실패 시:**
- 오류 메시지 확인
- 주요 원인:
  - 테이블 `kv_store_8aea8ee5`가 존재하지 않음
  - JSON 형식 오류
  - 권한 부족

---

### **Step 5: 데이터 저장 확인**

SQL Editor에서 아래 쿼리 실행:

```sql
-- 저장된 데이터 확인
SELECT 
  key, 
  jsonb_pretty(value) AS formatted_data,
  created_at,
  updated_at
FROM kv_store_8aea8ee5 
WHERE key = 'dms_manual_data_v1';
```

#### **예상 결과:**
```json
{
  "translations": {
    "ko": { ... },
    "en": { ... }
  },
  "commonVisibility": { ... },
  "pageMetadata": { ... },
  "menuStructure": [ ... ],
  "updatedAt": "2024-12-01T10:30:00.000Z"
}
```

---

## 🔍 트러블슈팅

### **오류 1: 테이블이 존재하지 않음**
```
ERROR: relation "kv_store_8aea8ee5" does not exist
```

**해결 방법:**
```sql
-- 테이블 생성
CREATE TABLE IF NOT EXISTS kv_store_8aea8ee5 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

### **오류 2: JSON 형식 오류**
```
ERROR: invalid input syntax for type json
```

**해결 방법:**
- SQL 스크립트를 다시 복사 (중간에 잘리지 않도록)
- 따옴표 escape 확인

---

### **오류 3: 권한 부족**
```
ERROR: permission denied for table kv_store_8aea8ee5
```

**해결 방법:**
- Supabase 프로젝트 소유자 계정으로 로그인
- Service Role 권한 확인

---

## ✅ 매뉴얼 사이트 반영 확인

### **Step 1: 프론트엔드 새로고침**
1. DMS 매뉴얼 사이트 접속
2. 브라우저 **새로고침** (Ctrl+R 또는 F5)
3. 캐시 삭제 후 새로고침 (Ctrl+Shift+R)

### **Step 2: 데이터 로드 확인**
브라우저 개발자 도구 (F12) > Console 탭에서 확인:

```javascript
[LanguageContext] Manual data loaded from Supabase
[LanguageContext] Translation keys: 120+
[LanguageContext] Categories: 7
```

### **Step 3: 페이지 표시 확인**
1. 좌측 사이드바에서 **"관리자 로그인"** 클릭
2. 제목: "관리자 로그인" 표시 확인
3. Step 1~3 내용 확인

---

## 📊 저장된 데이터 구조

```json
{
  "translations": {
    "ko": {
      "category.start": "DMS 시작하기",
      "section.login.admin": "관리자 로그인",
      "login-admin.title": "관리자 로그인",
      "login-admin.intro": "...",
      "login-admin.step1.title": "...",
      ...
    },
    "en": { ... }
  },
  "commonVisibility": {
    "login-admin.step1.visible": true,
    "login-admin.step1.image-visible": true,
    ...
  },
  "pageMetadata": {
    "login-admin": { "layout": "default" },
    ...
  },
  "menuStructure": [
    {
      "id": "start",
      "pages": ["start-features"]
    },
    {
      "id": "login",
      "pages": ["login-admin", "login-member"]
    },
    ...
  ]
}
```

---

## 🎉 완료!

이제 DMS 매뉴얼 사이트에서 모든 페이지와 콘텐츠가 정상적으로 표시됩니다.

### **저장된 페이지 목록:**
- ✅ DMS 시작하기
- ✅ 관리자 로그인
- ✅ 회원 앱 가입 안내
- ✅ 상식플러스 앱 소개
- ✅ DMS-상식플러스(App) 연결
- ✅ 회원 대시보드
- ✅ 회원 정보 관리
- ✅ 식사 기록 관리
- ✅ 영양 리포트
- ✅ 온라인 상담

---

## 💡 추가 작업

### **이미지 추가 방법:**
1. Admin 페이지 접속 (`/admin`)
2. 해당 페이지 선택 (예: "관리자 로그인")
3. Step별로 "이미지 표시" 체크박스 활성화
4. 이미지 파일 업로드
5. **[저장]** 버튼 클릭

### **텍스트 수정 방법:**
1. Admin 페이지에서 페이지 선택
2. 제목/설명/Step 내용 수정
3. **[저장]** 버튼 클릭

---

## 📞 문의

문제 발생 시 개발팀에 문의하세요:
- Console 로그 스크린샷
- 오류 메시지
- 실행한 SQL 쿼리
