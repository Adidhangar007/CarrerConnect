import { Badge } from "@/components/ui/badge";
import { ApplicationStatus, JobStatus } from "../backend";

interface StatusBadgeProps {
  status: ApplicationStatus | JobStatus;
  className?: string;
}

const applicationStatusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  [ApplicationStatus.Pending]: {
    label: "Pending",
    className: "bg-accent/10 text-accent border-accent/20",
  },
  [ApplicationStatus.Viewed]: {
    label: "Viewed",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  [ApplicationStatus.Accepted]: {
    label: "Accepted",
    className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
  [ApplicationStatus.Rejected]: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const jobStatusConfig: Record<JobStatus, { label: string; className: string }> =
  {
    [JobStatus.Open]: {
      label: "Open",
      className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    },
    [JobStatus.Closed]: {
      label: "Closed",
      className: "bg-muted text-muted-foreground border-border",
    },
  };

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config =
    status in ApplicationStatus
      ? applicationStatusConfig[status as ApplicationStatus]
      : jobStatusConfig[status as JobStatus];

  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${config?.className ?? ""} ${className}`}
    >
      {config?.label ?? status}
    </Badge>
  );
}
