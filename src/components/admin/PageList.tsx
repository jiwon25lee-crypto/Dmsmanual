/**
 * 페이지 목록 컴포넌트 - 빠른 편집용
 */

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, FileText } from "lucide-react";

interface PageListProps {
  onSelectPage: (pageId: string) => void;
}

// 현재 매뉴얼의 모든 페이지 목록
const pages = [
  { id: "start-features", category: "DMS 시작하기", title: "DMS 주요 기능" },
  { id: "start-intro", category: "DMS 시작하기", title: "DMS 소개" },
  { id: "login-admin", category: "DMS 로그인/회원가입", title: "기관 대표 관리자 회원가입" },
  { id: "login-member", category: "DMS 로그인/회원가입", title: "구성원 초대 및 구성원 회원 가입" },
  { id: "member-dashboard", category: "회원 정보", title: "대시보드 구성" },
  { id: "member-info", category: "회원 정보", title: "회원정보 조회" },
  { id: "member-edit", category: "회원 정보", title: "회원정보 수정" },
  { id: "device-list", category: "기기 관리", title: "기기 목록" },
  { id: "device-register", category: "기기 관리", title: "기기 등록" },
  { id: "notice-list", category: "서비스 공지사항", title: "공지사항 목록" },
];

export function PageList({ onSelectPage }: PageListProps) {
  // 카테고리별 그룹화
  const groupedPages = pages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, typeof pages>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedPages).map(([category, categoryPages]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categoryPages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <div>
                  <div className="font-medium text-foreground">{page.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ID: {page.id}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectPage(page.id)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  편집
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
