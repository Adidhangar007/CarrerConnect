import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  ctaHref?: string;
  dataOcid?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
  ctaHref,
  dataOcid = "empty_state",
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      data-ocid={dataOcid}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {ctaLabel && (onCta || ctaHref) && (
        <div className="mt-5">
          {ctaHref ? (
            <a href={ctaHref}>
              <Button data-ocid={`${dataOcid}.cta_button`}>{ctaLabel}</Button>
            </a>
          ) : (
            <Button onClick={onCta} data-ocid={`${dataOcid}.cta_button`}>
              {ctaLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
