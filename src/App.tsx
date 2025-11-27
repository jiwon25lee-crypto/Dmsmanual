import { useState, useEffect } from 'react';
import { ManualSidebar } from './components/ManualSidebar';
import { ManualContent } from './components/ManualContent';
import { LanguageProvider } from './components/LanguageContext';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('start-features');
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // 🚨 임시: 백오피스 강제 표시 (디버깅용)
  const FORCE_ADMIN = window.location.hash.includes('admin');

  // 해시 체크 함수
  const checkAdminRoute = () => {
    try {
      const hash = window.location.hash || '';
      const pathname = window.location.pathname || '';
      
      const isAdmin = 
        hash.includes('admin') || 
        pathname.includes('admin');
      
      console.log('[Admin Route Check]');
      console.log('  - Current hash:', hash);
      console.log('  - Current pathname:', pathname);
      console.log('  - Is admin:', isAdmin);
      
      setIsAdminRoute(isAdmin);
      setIsReady(true);
    } catch (error) {
      console.error('[Admin Route Check Error]', error);
      setIsReady(true);
    }
  };

  // 컴포넌트 마운트 및 해시 변경 감지
  useEffect(() => {
    console.log('[App] Mounting...');
    
    // 초기 체크
    checkAdminRoute();

    // 해시 변경 이벤트 리스너
    const handleHashChange = () => {
      console.log('[Hash Changed]');
      checkAdminRoute();
    };

    // 뒤로가기/앞으로가기 이벤트 리스너
    const handlePopState = () => {
      console.log('[Pop State]');
      checkAdminRoute();
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileSidebarOpen(false);
  };

  // 로딩 중
  if (!isReady) {
    console.log('[Rendering] Loading...');
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // 백오피스 렌더링
  if (isAdminRoute || FORCE_ADMIN) {
    console.log('[Rendering] Admin Dashboard');
    return (
      <LanguageProvider>
        <AdminDashboard />
        <Toaster />
      </LanguageProvider>
    );
  }

  // 매뉴얼 페이지 렌더링
  console.log('[Rendering] Manual Page');
  return (
    <LanguageProvider>
      <div className="flex h-screen bg-background">
        <ManualSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        <ManualContent
          activeSection={activeSection}
          isSidebarCollapsed={isSidebarCollapsed}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          onSectionChange={handleSectionChange}
        />
      </div>
      <Toaster />
    </LanguageProvider>
  );
}