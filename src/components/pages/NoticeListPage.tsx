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

export function NoticeListPage({ pageId: _providedPageId }: NoticeListPageProps) {
  const { t, getTranslation } = useLanguage();

  // ✅ pageId를 그대로 사용 (translationKey 매핑 불필요)
  const pageId = _providedPageId || "notice-list";

  console.log('[NoticeListPage] ========== RENDERING ==========');
  console.log('[NoticeListPage] pageId:', pageId);
  console.log('[NoticeListPage] title:', t(`${pageId}.title`));
  console.log('[NoticeListPage] badge.important:', t(`${pageId}.badge.important`));
  console.log('[NoticeListPage] badge.new:', t(`${pageId}.badge.new`));

  // 공지사항 데이터 구조
  interface Notice {
    number: number;
    id: string;
    titleKey: string;
    dateKey: string;
    contentKey: string;
    isImportant: boolean;
    isNew: boolean;
  }

  // ✅ 동적으로 모든 공지사항 로드 (notice1~notice20)
  const allNotices: Notice[] = [];
  for (let i = 1; i <= 20; i++) {
    const titleKey = `${pageId}.notice${i}.title`;
    const titleKo = getTranslation(titleKey, 'ko') as string;
    
    // 한국어 제목이 있으면 해당 Notice는 존재하는 것으로 간주
    if (titleKo) {
      allNotices.push({
        number: i,
        id: `notice${i}`,
        titleKey,
        dateKey: `${pageId}.notice${i}.date`,
        contentKey: `${pageId}.notice${i}.content`,
        isImportant: t(`${pageId}.notice${i}.isImportant`) === true,
        isNew: t(`${pageId}.notice${i}.isNew`) === true,
      });
    }
  }

  // visible 속성으로 필터링
  const visibleNotices = allNotices.filter((notice) => {
    const visibleKey = `${pageId}.${notice.id}.visible`;
    return t(visibleKey) !== false; // 기본값 true
  });

  // ✅ 번호 오름차순 정렬 (1번이 최신, 2번이 그 다음...)
  const sortedNotices = visibleNotices.sort((a, b) => a.number - b.number);

  console.log('[NoticeListPage] visibleNotices:', visibleNotices.length);
  console.log('[NoticeListPage] sortedNotices:', sortedNotices.map(n => `Notice ${n.number}`).join(', '));
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
          {sortedNotices.map((notice) => (
            <AccordionItem
              key={notice.id}
              value={notice.id}
              className="border border-border rounded-lg bg-white px-6 py-2"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-start gap-4 flex-1 text-left">
                  {/* 제목 및 배지 영역 */}
                  <div className="flex-1">
                    {/* 배지 영역 - 제목 위에 작게 표시 */}
                    <div className="flex gap-2 mb-2">
                      {notice.isImportant && (
                        <Badge
                          variant="destructive"
                          className="bg-red text-white px-2 py-0.5 text-xs h-5"
                        >
                          {t(`${pageId}.badge.important`)}
                        </Badge>
                      )}
                      {notice.isNew && (
                        <Badge
                          variant="default"
                          className="bg-brand text-white px-2 py-0.5 text-xs h-5"
                        >
                          {t(`${pageId}.badge.new`)}
                        </Badge>
                      )}
                    </div>

                    {/* 제목 */}
                    <h3 className="text-foreground mb-2">
                      {t(notice.titleKey)}
                    </h3>
                    
                    {/* 날짜 */}
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

      {/* ✅ 하단 안내 (조건부 렌더링) */}
      {t(`${pageId}.tip-visible`) === true && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-foreground leading-relaxed">
            💡 <span className="font-semibold">{t(`${pageId}.tip-title`)}</span>
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {t(`${pageId}.tip-desc`)}
          </p>
        </div>
      )}
    </>
  );
}