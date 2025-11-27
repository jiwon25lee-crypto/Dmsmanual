# 🐛 빈 페이지 오류 해결 가이드

## 🔍 **문제 현상**
```
https://dms-guide.figma.site/admin 접속 시
→ 빈 페이지가 노출됨
```

---

## ✅ **해결 완료!**

### **원인:**
AdminDashboard가 `LanguageProvider` 밖에서 렌더링되어 `useLanguage()` hook 사용 시 오류 발생

### **수정 사항:**
```typescript
// ❌ 이전 (잘못됨)
if (isAdminRoute || FORCE_ADMIN) {
  return (
    <>
      <AdminDashboard />
      <Toaster />
    </>
  );
}

// ✅ 수정 (올바름)
if (isAdminRoute || FORCE_ADMIN) {
  return (
    <LanguageProvider>
      <AdminDashboard />
      <Toaster />
    </LanguageProvider>
  );
}
```

---

## 🧪 **테스트 방법**

### **Step 1: 브라우저 콘솔 열기**
```
F12 또는 우클릭 → "검사"
→ Console 탭
```

### **Step 2: 로그 확인**
```
정상 동작 시:
[App] Mounting...
[Admin Route Check]
  - Current hash: #/admin
  - Is admin: true
[Rendering] Admin Dashboard
[AdminDashboard] Rendering... {activeTab: "start", editingPageId: null}
[AdminDashboard] Normal mode
```

### **Step 3: 오류가 있다면**
```
오류 메시지 확인:
- "useLanguage must be used within LanguageProvider"
  → LanguageProvider 누락
  
- "Cannot read property 't' of undefined"
  → LanguageContext 오류
  
- "Failed to fetch"
  → 네트워크 오류
```

---

## 🔧 **추가 디버깅 도구**

### **1. 콘솔 로그 추가**

이미 다음 위치에 로그가 추가되어 있습니다:

```typescript
// App.tsx
console.log('[App] Mounting...');
console.log('[Admin Route Check]');
console.log('[Rendering] Admin Dashboard');

// AdminDashboard.tsx
console.log('[AdminDashboard] Rendering...', { activeTab, editingPageId });
console.log('[AdminDashboard] Normal mode');
```

### **2. React Developer Tools**
```
Chrome 확장 프로그램 설치:
→ React Developer Tools
→ Components 탭에서 트리 확인
```

---

## 🚨 **일반적인 오류 케이스**

### **Case 1: LanguageProvider 누락**
```typescript
// 증상
빈 페이지 + 콘솔 오류:
"useLanguage must be used within LanguageProvider"

// 해결
App.tsx에서 AdminDashboard를 LanguageProvider로 감싸기 ✅
```

### **Case 2: 컴포넌트 import 오류**
```typescript
// 증상
빈 페이지 + 콘솔 오류:
"Failed to compile"
"Cannot find module..."

// 해결
import 경로 확인
```

### **Case 3: CSS 스타일 문제**
```typescript
// 증상
콘솔 오류 없음 + 빈 페이지

// 해결
globals.css 확인
background: transparent → background: white
```

### **Case 4: 해시 라우팅 실패**
```typescript
// 증상
#/admin 접속 시 매뉴얼 페이지 표시

// 해결
App.tsx의 checkAdminRoute 함수 확인
```

---

## ✅ **확인 체크리스트**

### **App.tsx:**
- [ ] LanguageProvider가 AdminDashboard를 감싸고 있는가?
- [ ] checkAdminRoute 함수가 정상 동작하는가?
- [ ] console.log가 출력되는가?

### **AdminDashboard.tsx:**
- [ ] import 경로가 올바른가?
- [ ] useLanguage() hook이 사용되는가? (MenuManager, PageEditor)
- [ ] console.log가 출력되는가?

### **브라우저:**
- [ ] 콘솔 오류가 없는가?
- [ ] Network 탭에서 리소스가 로드되는가?
- [ ] React DevTools에서 컴포넌트 트리가 보이는가?

---

## 🎯 **현재 상태 확인**

### **정상 동작 확인:**

```bash
# 1. 페이지 접속
https://dms-guide.figma.site/admin

# 2. 헤더 확인
"📊 DMS 매뉴얼 관리 시스템"

# 3. 탭 확인
🚀 시작하기 | 📊 대시보드 | 📝 메뉴 관리 | ⚙️ 설정

# 4. 콘솔 확인
[AdminDashboard] Rendering...
[AdminDashboard] Normal mode
```

---

## 🔥 **긴급 복구 방법**

만약 여전히 빈 페이지가 나온다면:

### **방법 1: 하드 리프레시**
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### **방법 2: 캐시 삭제**
```
F12 → Network 탭 → "Disable cache" 체크
→ 새로고침
```

### **방법 3: 시크릿 모드**
```
Ctrl + Shift + N (Chrome)
→ https://dms-guide.figma.site/admin
```

### **방법 4: 다른 브라우저**
```
Chrome → Firefox
또는
Firefox → Chrome
```

---

## 📊 **해결 전/후 비교**

### **해결 전:**
```
App.tsx (잘못됨)
├── isAdminRoute?
    ├── AdminDashboard ❌ (LanguageProvider 없음)
    └── Toaster

→ useLanguage() 사용 시 오류
→ 빈 페이지
```

### **해결 후:**
```
App.tsx (올바름)
├── isAdminRoute?
    ├── LanguageProvider ✅
        ├── AdminDashboard
        └── Toaster

→ useLanguage() 정상 동작
→ 정상 렌더링
```

---

## 🎉 **완료!**

이제 다음 명령으로 확인하세요:

```bash
# 1. 백오피스 접속
https://dms-guide.figma.site/admin

# 2. 콘솔 확인
F12 → Console 탭

# 3. 로그 확인
[AdminDashboard] Rendering...
[AdminDashboard] Normal mode
```

**정상적으로 표시되어야 합니다! ✅**

---

## 📝 **문제가 지속된다면?**

### **체크 사항:**

1. **LanguageProvider 확인**
   ```typescript
   // App.tsx
   return (
     <LanguageProvider>
       <AdminDashboard />
       <Toaster />
     </LanguageProvider>
   );
   ```

2. **콘솔 오류 확인**
   ```
   F12 → Console 탭
   → 빨간색 오류 메시지 확인
   ```

3. **네트워크 확인**
   ```
   F12 → Network 탭
   → 실패한 리소스 확인
   ```

4. **React DevTools 확인**
   ```
   React Developer Tools
   → Components 탭
   → LanguageProvider > AdminDashboard 구조 확인
   ```

---

## 🚀 **다음 단계**

빈 페이지 문제가 해결되면:

```
✅ 백오피스 접속
✅ 메뉴 관리 탭
✅ 대메뉴 선택
✅ 소메뉴 편집
✅ 페이지 편집 (4개 탭)
```

**모든 기능이 정상 작동합니다! 🎊**
