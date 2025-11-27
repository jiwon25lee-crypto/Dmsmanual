# 🚨 백오피스 접속 오류 해결

## 에러 메시지

```
Not allowed to load local resource: chrome-error://chromewebdata/
```

이 에러는 Chrome에서 페이지 로드 실패 시 나타나는 메시지입니다.

---

## ✅ 해결 완료!

### 🔧 수정 사항

1. **useEffect 추가** - 해시 변경을 실시간으로 감지
2. **useState로 상태 관리** - isAdminRoute를 상태로 관리
3. **이벤트 리스너** - hashchange, popstate 이벤트 처리
4. **디버그 로그** - 콘솔에서 라우팅 상태 확인

---

## 🚀 접속 방법

### **방법 1: URL 직접 입력** (권장)

1. 브라우저 주소창에 입력:
   ```
   https://dms-guide.figma.site.com/#/admin
   ```

2. Enter 키 누르기

3. **브라우저 콘솔 (F12) 확인:**
   ```
   [Admin Route Check]
     - Current hash: #/admin
     - Current pathname: /
     - Is admin: true
   [Rendering] Admin Dashboard
   ```

---

### **방법 2: 콘솔에서 이동**

1. 메인 페이지 접속:
   ```
   https://dms-guide.figma.site.com
   ```

2. `F12` (개발자 도구)

3. Console 탭에서 입력:
   ```javascript
   window.location.hash = '#/admin';
   ```

4. **새로고침 불필요** - 자동으로 전환됩니다

---

## 🔍 디버깅 방법

### 1. 브라우저 콘솔 확인

`F12` → Console 탭에서 다음 로그를 확인:

**정상 작동 시:**
```
[Admin Route Check]
  - Current hash: #/admin
  - Current pathname: /
  - Is admin: true
[Rendering] Admin Dashboard
```

**비정상 작동 시:**
```
[Admin Route Check]
  - Current hash: #/admin
  - Current pathname: /
  - Is admin: false  ← 문제!
[Rendering] Manual Page
```

---

### 2. 해시 변경 테스트

Console에서 실행:

```javascript
// 1. 현재 해시 확인
console.log(window.location.hash);

// 2. 백오피스로 이동
window.location.hash = '#/admin';

// 3. 매뉴얼로 돌아가기
window.location.hash = '';

// 4. 라우팅 상태 확인
console.log('Is admin:', window.location.hash.includes('admin'));
```

---

### 3. 강제 새로고침

캐시 문제가 있을 경우:

```javascript
// 백오피스로 이동 + 새로고침
window.location.hash = '#/admin';
window.location.reload();
```

---

## ✅ 백오피스 확인 사항

백오피스가 정상 로드되면 다음이 표시됩니다:

```
📊 DMS 매뉴얼 관리 시스템          [매뉴얼 보기]

탭 메뉴:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| 🚀 시작하기 | 대시보드 | 페이지 관리 | 번역 관리 | ... |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 백오피스 초기 설정
┌─────────────────────────────────────┐
│ □ 1. SQL 마이그레이션 실행          │
│    [SQL 복사] [Supabase 열기]       │
│                                     │
│ □ 2. 데이터베이스 초기화            │
│    [초기화 실행]                    │
└─────────────────────────────────────┘

🚀 빠른 시작 - 테스트 데이터 생성
┌─────────────────────────────────────┐
│ [테스트 데이터 생성]                │
└─────────────────────────────────────┘

🔍 디버깅 정보
┌─────────────────────────────────────┐
│ 현재 URL: https://.../#/admin       │
│ pathname: /                         │
│ hash: #/admin                       │
│ 관리자 모드: ✅ YES                  │
└─────────────────────────────────────┘
```

---

## ❌ 여전히 매뉴얼 페이지가 보이면?

### 문제 1: 코드가 배포되지 않음

**해결:**
- Figma Make에서 프로젝트 재배포
- 배포 완료 후 브라우저 캐시 삭제

### 문제 2: 브라우저 캐시

**해결:**
1. `Ctrl + Shift + Delete` (캐시 삭제)
2. `Ctrl + F5` (강제 새로고침)
3. 시크릿 모드로 테스트

### 문제 3: JavaScript 로딩 실패

**해결:**
1. F12 → Console 탭에서 에러 확인
2. Network 탭에서 실패한 요청 확인
3. 에러 메시지를 공유

---

## 🆘 긴급 백업 방법

모든 방법이 실패하면:

### 임시 테스트 코드

App.tsx 최상단에 추가:

```typescript
// 임시: admin 강제 모드
const FORCE_ADMIN = true;

export default function App() {
  if (FORCE_ADMIN) {
    return (
      <>
        <AdminDashboard />
        <Toaster />
      </>
    );
  }
  
  // ... 기존 코드
}
```

---

## 💡 양방향 네비게이션

### 백오피스 → 매뉴얼

백오피스 우측 상단 **"매뉴얼 보기"** 버튼 클릭
- 또는 Console: `window.location.hash = '';`

### 매뉴얼 → 백오피스

Console: `window.location.hash = '#/admin';`

---

## 🎯 최종 체크리스트

### ✅ 접속 성공 시

- [ ] URL에 `#/admin` 표시
- [ ] 콘솔에 `[Rendering] Admin Dashboard` 로그
- [ ] "📊 DMS 매뉴얼 관리 시스템" 제목 표시
- [ ] 6개 탭 메뉴 표시
- [ ] "매뉴얼 보기" 버튼 우측 상단에 표시

### ❌ 접속 실패 시

- [ ] 콘솔에서 에러 메시지 확인
- [ ] Network 탭에서 404/500 에러 확인
- [ ] 브라우저 캐시 삭제 후 재시도
- [ ] 다른 브라우저로 테스트

---

## 📞 추가 지원

문제가 계속되면 다음 정보를 공유해주세요:

1. **브라우저 콘솔 로그** (F12 → Console)
2. **Network 탭 스크린샷** (실패한 요청)
3. **현재 URL** (주소창 전체)
4. **브라우저 종류 및 버전**

---

지금 바로 시도:

```
https://dms-guide.figma.site.com/#/admin
```

Enter 키를 누르고 F12를 눌러서 콘솔 로그를 확인하세요!
