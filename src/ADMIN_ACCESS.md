# 🔐 백오피스 접속 방법

## 방법 1: 해시 라우팅 (권장) ✅

브라우저 주소창에 다음을 입력:

```
https://your-app-url.com/#/admin
```

또는 로컬 개발 환경:
```
http://localhost:5173/#/admin
```

**장점:**
- ✅ 클라이언트 사이드 라우팅으로 즉시 작동
- ✅ 별도 설정 필요 없음
- ✅ 일반 사용자에게 노출되지 않음

---

## 방법 2: 브라우저 콘솔 사용

1. 매뉴얼 페이지 접속:
   ```
   https://your-app-url.com
   ```

2. 개발자 도구 열기 (`F12`)

3. Console 탭에서 다음 입력:
   ```javascript
   window.location.hash = '#/admin';
   window.location.reload();
   ```

---

## 방법 3: 직접 경로 (서버 설정 필요)

```
https://your-app-url.com/admin
```

**주의:** 이 방법은 서버에서 `/admin` 경로를 `/index.html`로 리다이렉트하도록 설정해야 합니다.

### Nginx 설정 예시:
```nginx
location /admin {
  try_files $uri /index.html;
}
```

### Apache 설정 예시:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^admin /index.html [L]
```

---

## ✅ 접속 확인

백오피스에 성공적으로 접속하면 다음 화면이 보입니다:

```
📊 DMS 매뉴얼 관리 시스템

탭:
- 🚀 시작하기 (기본)
- 대시보드
- 페이지 관리
- 번역 관리
- Visibility
- 이미지
```

---

## 🐛 문제 해결

### 문제: "페이지를 찾을 수 없습니다" (404)

**원인**: 서버가 `/admin` 경로를 인식하지 못함

**해결:**
- 방법 1 사용: `/#/admin` (해시 라우팅)
- 또는 서버 리다이렉트 설정

### 문제: 백오피스가 빈 화면

**원인**: JavaScript 로딩 오류

**해결:**
1. 브라우저 개발자 도구 (F12) 열기
2. Console 탭에서 에러 확인
3. Network 탭에서 실패한 요청 확인

### 문제: 매뉴얼 페이지가 계속 표시됨

**원인**: 라우팅 로직 오류

**해결:**
1. 브라우저 캐시 삭제 (`Ctrl + Shift + Delete`)
2. 페이지 새로고침 (`Ctrl + F5`)
3. 시크릿 모드로 접속 테스트

---

## 💡 추천 방법

가장 간단한 방법은 **해시 라우팅**입니다:

```
https://your-app-url.com/#/admin
```

이 방법은 모든 환경에서 작동하며 별도 설정이 필요 없습니다.

---

## 🔒 보안 참고사항

**현재 버전:**
- ❌ 로그인/인증 없음
- ❌ 접근 제어 없음
- ⚠️ 누구나 백오피스 접근 가능

**프로덕션 배포 시 권장사항:**
- Phase 2에서 Supabase Auth 구현
- 관리자 계정으로만 접근 제한
- IP 화이트리스트 설정
- HTTPS 필수

---

빠른 테스트를 위해 지금은 **`/#/admin`** 경로를 사용하세요!