/**
 * 디버깅 정보 - 개발 중에만 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState, useEffect } from "react";

export function DebugInfo() {
  const [info, setInfo] = useState({
    hash: "",
    pathname: "",
    href: "",
    isAdmin: false,
  });

  useEffect(() => {
    const updateInfo = () => {
      setInfo({
        hash: window.location.hash,
        pathname: window.location.pathname,
        href: window.location.href,
        isAdmin: 
          window.location.hash.includes('admin') || 
          window.location.pathname.includes('admin'),
      });
    };

    updateInfo();
    
    window.addEventListener('hashchange', updateInfo);
    window.addEventListener('popstate', updateInfo);
    
    return () => {
      window.removeEventListener('hashchange', updateInfo);
      window.removeEventListener('popstate', updateInfo);
    };
  }, []);

  // 프로덕션에서는 표시하지 않음
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="mt-6 border-yellow bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm">🔍 디버깅 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="font-semibold">현재 URL:</span>
          <span className="text-muted-foreground">{info.href}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">pathname:</span>
          <span className="text-muted-foreground">{info.pathname || '/'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">hash:</span>
          <span className="text-muted-foreground">{info.hash || '(없음)'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">관리자 모드:</span>
          <span className={info.isAdmin ? "text-green" : "text-red"}>
            {info.isAdmin ? '✅ YES' : '❌ NO'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
