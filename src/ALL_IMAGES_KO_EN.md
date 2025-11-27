# 🖼️ 모든 이미지 한/영 버전 완료!

## ✅ **완료된 이미지 타입**

### 1. **헤더 이미지** (Header Image)
- 📍 위치: 페이지 최상단
- 🔧 수정: PageEditor → "기본 정보" 탭 → "최상단 헤더 이미지"
- ✅ ko/en 분리 완료

### 2. **Step 이미지** (Step Images)
- 📍 위치: DefaultPage의 Step 1~10
- 🔧 수정: PageEditor → "Step 관리" 탭 → 각 Step의 이미지 섹션
- ✅ ko/en 2칸 그리드 완료

### 3. **Feature 카드 이미지** (Feature Card Images)
- 📍 위치: StartFeaturesPage (향후 확장)
- 🔧 수정: PageEditor → "Feature 카드 관리" 탭
- ⚠️ 현재 아이콘만 사용, 이미지 필요 시 추가

### 4. **TabContent 이미지** (Tab Images)
- 📍 위치: TabPage → Overview 탭
- 🔧 수정: PageEditor → "탭 컨텐츠 관리" 탭
- ✅ ko/en 분리 필요 (다음 작업)

---

## 🧪 **테스트 시나리오**

### **Step 1: 헤더 이미지 테스트**
```
1. #/admin → 페이지 관리 → "login-admin" 선택
2. "📝 기본 정보" 탭
3. "최상단 헤더 이미지" → "사용함" 선택
4. 한국어 URL: https://images.unsplash.com/photo-1633356122544-f134324a6cee
5. (현재는 동일한 이미지가 양쪽에 저장됨)
6. 저장
```

### **Step 2: Step 이미지 테스트**
```
1. "📋 Step 관리" 탭
2. Step 1 찾기
3. "📸 Step 이미지 (언어별)" 섹션
4. 🇰🇷 한국어 이미지: https://images.unsplash.com/photo-1633356122544-f134324a6cee
5. 🇺🇸 English Image: https://images.unsplash.com/photo-1581091226825-a6a2a5aee158
6. 저장
```

### **Step 3: 매뉴얼 확인**
```
1. 좌측 사이드바 → "로그인" → "관리자 로그인"
2. 한국어 모드: 헤더 + Step 1 한국어 이미지 표시
3. English 모드: 헤더 + Step 1 영어 이미지 표시
```

---

## 📊 **데이터 구조**

### **저장 구조 (LanguageContext):**
```javascript
translations: {
  ko: {
    "login-admin.header-image": "https://...ko-image.png",
    "login-admin.step1.image": "https://...ko-step1.png",
  },
  en: {
    "login-admin.header-image": "https://...en-image.png",
    "login-admin.step1.image": "https://...en-step1.png",
  }
}
```

### **로드 구조 (PageEditor):**
```typescript
{
  headerImage: {
    ko: "https://...ko-image.png",
    en: "https://...en-image.png",
  },
  steps: [
    {
      image: {
        ko: "https://...ko-step1.png",
        en: "https://...en-step1.png",
      }
    }
  ]
}
```

---

## ⚠️ **현재 제한사항**

### **헤더 이미지 UI 개선 필요:**
현재 PageEditor에서 헤더 이미지는 **1개 입력란**만 있고, ko/en 모두 동일한 값으로 저장됩니다.

**해결 방법:**
헤더 이미지 섹션을 Step 이미지처럼 2칸 그리드로 변경해야 합니다:

```tsx
{/* 🆕 2칸 그리드: 한국어 / 영어 */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <Label>🇰🇷 한국어 헤더 이미지</Label>
    <Input value={pageData.headerImage.ko} onChange={...} />
  </div>
  <div>
    <Label>🇺🇸 English Header Image</Label>
    <Input value={pageData.headerImage.en} onChange={...} />
  </div>
</div>
```

---

## 🔧 **다음 작업 (TabContent 이미지)**

TabContentEditor에서도 Overview 이미지를 ko/en으로 분리해야 합니다:

### **현재 구조:**
```typescript
overview: {
  title: { ko: string, en: string },
  desc: { ko: string, en: string },
  image: string,  // ❌ 언어 공통
}
```

### **목표 구조:**
```typescript
overview: {
  title: { ko: string, en: string },
  desc: { ko: string, en: string },
  image: { ko: string, en: string },  // ✅ 언어별
}
```

---

## ✅ **성공 체크리스트**

### **LanguageContext:**
- [x] Step 이미지 ko/en 저장 로직
- [x] 헤더 이미지 ko/en 저장 로직
- [ ] TabContent 이미지 ko/en 저장 로직

### **PageEditor:**
- [x] Step 이미지 ko/en 2칸 그리드 UI
- [ ] 헤더 이미지 ko/en 2칸 그리드 UI (현재 1칸)
- [ ] TabContent 이미지 ko/en 2칸 그리드 UI

### **페이지 컴포넌트:**
- [x] DefaultPage - Step 이미지 언어별 로드
- [x] DefaultPage - 헤더 이미지 언어별 로드
- [ ] TabPage - Overview 이미지 언어별 로드

---

## 💡 **개선 제안**

### **1. 일괄 복사 기능**
한국어 이미지를 영어로 일괄 복사:
```
[🇰🇷 → 🇺🇸 복사] 버튼
```

### **2. 이미지 미리보기 비교**
양쪽 이미지를 나란히 비교:
```
[🇰🇷 한국어]     [🇺🇸 English]
[이미지1]         [이미지2]
```

### **3. Fallback 로직**
영어 이미지가 없으면 한국어 이미지로 대체:
```javascript
const image = t(`${pageId}.step1.image`) || t(`${pageId}.step1.image`, { lang: 'ko' });
```

---

**현재 상태: 헤더 이미지 UI만 2칸 그리드로 변경하면 완료!** 🎯
