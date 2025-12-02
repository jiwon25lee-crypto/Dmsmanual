import { InfoIcon } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface TooltipProps {
  children: React.ReactNode;
}

export function Tooltip({ children }: TooltipProps) {
  return (
    <div className="bg-accent border border-border rounded-lg p-4 flex gap-3 my-6">
      <InfoIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <div className="text-foreground">{children}</div>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  visible?: boolean; // 기본값 true
}

export function Step({
  number,
  title,
  description,
  visible = true,
}: StepProps) {
  // visible이 false이면 렌더링 안함
  if (!visible) return null;

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface ImageContainerProps {
  src: string;
  alt: string;
  maxWidth?: string;
  maxHeight?: string;
  aspectRatio?: string;
}

export function ImageContainer({
  src,
  alt,
  maxWidth = "800px",
  maxHeight = "600px",
  aspectRatio,
}: ImageContainerProps) {
  return (
    <div className="bg-card rounded-sm border border-border mb-2 overflow-hidden">
      <div className="flex justify-center p-4 sm:p-6 lg:p-8">
        <ImageWithFallback
          src={src}
          alt={alt}
          className="w-full sm:w-auto rounded-lg"
          style={{
            maxWidth: `min(${maxWidth}, 100%)`,
            maxHeight,
            width: "auto",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}

interface TipBoxProps {
  title: string;
  description: string;
}

export function TipBox({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-lg p-6 mb-8 border border-border"
      style={{ backgroundColor: "var(--point-green)" }}
    >
      <h3 className="text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{description}</p>
    </div>
  );
}

interface FeatureGridProps {
  features: Array<{
    titleKey: string;
    descKey: string;
    visibleKey?: string;
  }>;
  columns?: 2 | 3;
  t: (key: string) => string | boolean;
  detailsKey?: string;
}

export function FeatureGrid({
  features,
  columns = 2,
  t,
  detailsKey,
}: FeatureGridProps) {
  const gridCols =
    columns === 3
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2";

  return (
    <div className={`grid ${gridCols} gap-6 mb-8`}>
      {features.map((feature, index) => {
        // visible 체크
        const isVisible = feature.visibleKey
          ? (t(feature.visibleKey) as boolean)
          : true;

        if (!isVisible) return null;

        return (
          <Card
            key={index}
          >
            <CardHeader>
              <CardTitle>{t(feature.titleKey) as string}</CardTitle>
              <CardDescription>
                {t(feature.descKey) as string}
              </CardDescription>
            </CardHeader>
            {detailsKey && (
              <CardContent>
                <p className="text-muted-foreground">
                  {t(detailsKey) as string}
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}