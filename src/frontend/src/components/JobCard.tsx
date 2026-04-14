import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Building2, Clock, DollarSign, LogIn, MapPin } from "lucide-react";
import { JobStatus, JobType } from "../backend";
import type { JobPublic } from "../backend.d.ts";

interface JobCardProps {
  job: JobPublic;
  index?: number;
  companyName?: string;
  onApply?: (job: JobPublic) => void;
  showActions?: boolean;
  showSignInPrompt?: boolean;
  actions?: React.ReactNode;
}

function formatSalary(min: bigint, max: bigint): string {
  const formatK = (n: bigint) => {
    const num = Number(n);
    return num >= 1000 ? `$${Math.round(num / 1000)}k` : `$${num}`;
  };
  return `${formatK(min)}–${formatK(max)}`;
}

function jobTypeBadge(type: JobType) {
  const map: Record<JobType, { label: string; className: string }> = {
    [JobType.FullTime]: {
      label: "Full-Time",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    [JobType.PartTime]: {
      label: "Part-Time",
      className: "bg-accent/10 text-accent border-accent/20",
    },
    [JobType.Remote]: {
      label: "Remote",
      className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    },
  };
  const config = map[type] ?? { label: type, className: "" };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

function timeAgo(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCard({
  job,
  index = 0,
  companyName,
  onApply,
  showActions = true,
  showSignInPrompt = false,
  actions,
}: JobCardProps) {
  const isClosed = job.status === JobStatus.Closed;
  const displayIndex = index + 1;

  return (
    <Card
      className={`border border-border shadow-card hover:shadow-elevated transition-smooth group ${
        isClosed ? "opacity-60" : ""
      }`}
      data-ocid={`jobs.item.${displayIndex}`}
    >
      <CardContent className="pt-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <Link
              to="/jobs/$jobId"
              params={{ jobId: job.id.toString() }}
              className="font-display font-semibold text-base text-foreground hover:text-primary transition-colors line-clamp-2 group-hover:text-primary"
              data-ocid={`jobs.item.${displayIndex}.title_link`}
            >
              {job.title}
            </Link>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Building2 size={13} />
              <span className="truncate">{companyName ?? "—"}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {jobTypeBadge(job.jobType)}
            {isClosed && (
              <Badge
                variant="outline"
                className="text-xs border-destructive/30 text-destructive"
              >
                Closed
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={13} />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign size={13} />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {timeAgo(job.postedAt)}
          </span>
        </div>

        {job.requiredSkills && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.requiredSkills
              .split(",")
              .slice(0, 4)
              .map((skill) => (
                <Badge
                  key={skill.trim()}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {skill.trim()}
                </Badge>
              ))}
          </div>
        )}
      </CardContent>

      {(showActions || actions) && (
        <CardFooter className="pt-0 pb-4 gap-2">
          {actions ?? (
            <>
              <Link
                to="/jobs/$jobId"
                params={{ jobId: job.id.toString() }}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  data-ocid={`jobs.item.${displayIndex}.view_button`}
                >
                  View Details
                </Button>
              </Link>
              {showSignInPrompt && !isClosed && (
                <Link to="/login" className="flex-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full flex items-center gap-1.5 text-primary"
                    data-ocid={`jobs.item.${displayIndex}.signin_button`}
                  >
                    <LogIn size={14} />
                    Sign in to apply
                  </Button>
                </Link>
              )}
              {onApply && !isClosed && !showSignInPrompt && (
                <Button
                  size="sm"
                  onClick={() => onApply(job)}
                  className="flex-1"
                  data-ocid={`jobs.item.${displayIndex}.apply_button`}
                >
                  Apply Now
                </Button>
              )}
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
