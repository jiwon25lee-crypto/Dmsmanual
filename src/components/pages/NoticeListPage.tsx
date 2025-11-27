import { useLanguage } from "../LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Calendar, Bell } from "lucide-react";

interface NoticeListPageProps {
  pageId?: string;
}

export function NoticeListPage({ pageId = "notice-list" }: NoticeListPageProps) {
  const { t } = useLanguage();

  console.log('[NoticeListPage] ========== RENDERING ==========');
  console.log('[NoticeListPage] pageId:', pageId);
  console.log('[NoticeListPage] title:', t(`${pageId}.title`));

  // 공지사항 데이터 구조
  interface Notice {
    id: string;
    titleKey: string;
    dateKey: string;
    contentKey: string;
  }

  // LanguageContext에서 visible 설정을 확인하여 표시할 공지사항만 필터링
  const allNotices: Notice[] = [
    {
      id: "notice1",
      titleKey: `${pageId}.notice1.title`,
      dateKey: `${pageId}.notice1.date`,
      contentKey: `${pageId}.notice1.content`,
    },
    {
      id: "notice2",
      titleKey: `${pageId}.notice2.title`,
      dateKey: `${pageId}.notice2.date`,
      contentKey: `${pageId}.notice2.content`,
    },
    {
      id: "notice3",
      titleKey: `${pageId}.notice3.title`,
      dateKey: `${pageId}.notice3.date`,
      contentKey: `${pageId}.notice3.content`,
    },
    {
      id: "notice4",
      titleKey: `${pageId}.notice4.title`,
      dateKey: `${pageId}.notice4.date`,
      contentKey: `${pageId}.notice4.content`,
    },
    {
      id: "notice5",
      titleKey: `${pageId}.notice5.title`,
      dateKey: `${pageId}.notice5.date`,
      contentKey: `${pageId}.notice5.content`,
    },
  ];

  // visible 속성으로 필터링
  const visibleNotices = allNotices.filter((notice) => {
    const visibleKey = `${pageId}.${notice.id}.visible`;
    return t(visibleKey) === true;
  });

  console.log('[NoticeListPage] visibleNotices:', visibleNotices.length);
  console.log('[NoticeListPage] ========== RENDER COMPLETE ==========');

  return (
    <>
      <h1 className="mb-6">{t(`${pageId}.title`)}</h1>

      <p className="text-foreground mb-8 leading-relaxed">
        {t(`${pageId}.intro`)}
      </p>

      {/* 공지사항 아코디언 리스트 */}
      <div className="mb-12">
        <Accordion type="single" collapsible className="space-y-4">
          {visibleNotices.map((notice) => (
            <AccordionItem
              key={notice.id}
              value={notice.id}
              className="border border-border rounded-lg bg-white px-6 py-2"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-start gap-4 flex-1 text-left">
                  {/* 배지 영역 */}
                  <div className="flex gap-2 flex-shrink-0 pt-1">
                    {t(`${pageId}.${notice.id}.isImportant`) === true && (
                      <Badge
                        variant="destructive"
                        className="bg-red text-white px-2 py-0.5 text-xs"
                      >
                        {t(`${pageId}.badge.important`)}
                      </Badge>
                    )}
                    {t(`${pageId}.${notice.id}.isNew`) === true && (
                      <Badge
                        variant="default"
                        className="bg-brand text-white px-2 py-0.5 text-xs"
                      >
                        {t(`${pageId}.badge.new`)}
                      </Badge>
                    )}
                  </div>

                  {/* 제목 및 날짜 */}
                  <div className="flex-1">
                    <h3 className="text-foreground mb-2">
                      {t(notice.titleKey)}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{t(notice.dateKey)}</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="pt-4 border-t border-border mt-4">
                  <div
                    className="text-foreground leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: String(t(notice.contentKey)),
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {visibleNotices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{t(`${pageId}.empty`)}</p>
          </div>
        )}
      </div>

      {/* 하단 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-foreground leading-relaxed">
          💡 <span className="font-semibold">{t(`${pageId}.tip-title`)}</span>
        </p>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {t(`${pageId}.tip-desc`)}
        </p>
      </div>
    </>
  );
}