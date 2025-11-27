# 🔧 브라우저 캐시 문제 해결 가이드

작성일: 2025-11-26

---

## 🚨 **문제 상황**

**증상:**
- 코드는 업데이트되었지만 브라우저에서 이전 버전이 실행됨
- 디버깅 로그가 콘솔에 나타나지 않음
- Admin 페이지가 최신 데이터를 표시하지 않음

**원인:**
브라우저가 JavaScript 파일을 캐시하여 새 버전을 로드하지 않음

---

## ✅ **해결 방법**

### 방법 1: 강제 새로고침 ⭐ **가장 빠름**

**Windows:**
```
Ctrl + Shift + R
```

**Mac:**
```
Cmd + Shift + R
```

---

### 방법 2: 캐시 완전 삭제 ⭐ **가장 확실**

**Chrome:**
1. `Ctrl + Shift + Delete` (캐시 삭제 창 열기)
2. 시간 범위: "전체 기간"
3. 체크: ✅ **캐시된 이미지 및 파일**
4. 체크 해제: ❌ 쿠키 및 사이트 데이터 (로그인 유지)
5. "데이터 삭제" 클릭
6. 페이지 새로고침

**Firefox:**
1. `Ctrl + Shift + Delete`
2. 시간 범위: "전체"
3. 체크: ✅ **캐시**
4. "지금 지우기" 클릭
5. 페이지 새로고침

---

### 방법 3: 개발자 도구에서 캐시 비활성화 ⭐ **개발 중 권장**

1. `F12` (개발자 도구 열기)
2. `Network` 탭 선택
3. ✅ **Disable cache** 체크
4. 개발자 도구를 열어둔 상태에서 작업
5. 페이지 새로고침

→ 개발자 도구가 열려 있는 동안 캐시를 사용하지 않음

---

### 방법 4: 시크릿 모드에서 테스트

**Windows:**
```
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)
```

**Mac:**
```
Cmd + Shift + N (Chrome)
Cmd + Shift + P (Firefox)
```

→ 시크릿 모드는 캐시를 사용하지 않음

---

## 🧪 **캐시 문제 확인 방법**

### 1. 콘솔 로그 확인

**예상 로그 (새 버전):**
```
[PageEditor] ========== useEffect TRIGGERED ==========
[PageEditor] pageId: notice-list
[PageEditor] updateTrigger: 1
[PageEditor] Current title from LanguageContext: "서비스 공지사항"
```

**실제 로그 (캐시된 버전):**
```
[PageEditor] useEffect triggered - reloading data for: notice-list
[PageEditor] Data reload complete for: notice-list
```

→ **"=========="가 없으면 캐시 문제!**

---

### 2. JavaScript 파일 버전 확인

**Network 탭에서 확인:**
1. `F12` → `Network` 탭
2. `Ctrl + R` (새로고침)
3. `*.js` 파일 필터
4. 파일명 확인:
   - ✅ 새 해시: `90a63adb5b8abc466082d2b644742795e90fafa2.js`
   - ❌ 오래된 해시: `4088aa4f2abed8aab88a6ac77563105a8e8bc38d.js`

---

## 🆕 **추가 수정 사항**

### `notice-list` 레이아웃 타입 수정 ✅

**파일:** `/components/LanguageContext.tsx`

**Before:**
```typescript
// notice-list가 pageMetadata에 없음
// → 기본값 "default" 사용됨 ❌
```

**After:**
```typescript
const initialPageMetadata: Record<string, PageMetadata> = {
  // ... 기존 페이지들
  
  // NoticeListPage (아코디언 레이아웃)
  "notice-list": { layout: "accordion" }, // ✅ 추가됨
};
```

---

## 📊 **로그 분석**

### 현재 로그 상태

```
✅ [LanguageContext] Loading data from Supabase...
✅ [LanguageContext] Data loaded from Supabase
✅ [AdminDashboard] Edit mode for: notice-list
✅ [PageEditor] Page layout: default for pageId: notice-list
❌ [PageEditor] useEffect triggered - reloading data for: notice-list
```

**문제:**
- `layout: default` ← 잘못됨 (accordion이어야 함)
- 디버깅 로그 없음 ← 캐시 문제

---

## 🎯 **최종 확인 사항**

캐시 삭제 후 다음을 확인하세요:

### 1. 콘솔 로그
```
✅ [PageEditor] ========== useEffect TRIGGERED ==========
✅ [PageEditor] updateTrigger: 1 (또는 더 큰 숫자)
✅ [PageEditor] Current title from LanguageContext: "서비스 공지사항"
```

### 2. 페이지 레이아웃
```
✅ [PageEditor] Page layout: accordion for pageId: notice-list
```

### 3. Admin 화면
- 제목 (한국어): "서비스 공지사항" ✅
- 공지사항 탭: "📢 공지사항 관리" ✅

---

## 🔄 **개발 중 권장 설정**

### Chrome DevTools 설정

1. `F12` (개발자 도구 열기)
2. `⚙️ Settings` (우측 상단 톱니바퀴)
3. **Network** 섹션:
   - ✅ Disable cache (while DevTools is open)
4. **Console** 섹션:
   - ✅ Preserve log

→ 이제 개발자 도구를 열어두면 항상 최신 코드가 실행됩니다!

---

## 📝 **요약**

1. **가장 빠른 해결:** `Ctrl + Shift + R` (강제 새로고침)
2. **가장 확실한 해결:** `Ctrl + Shift + Delete` (캐시 완전 삭제)
3. **개발 중:** `F12` → Network → ✅ Disable cache
4. **확인:** 콘솔에 "=========" 디버깅 로그 표시됨

---

**작성자: AI Assistant**  
**작성일: 2025-11-26**
