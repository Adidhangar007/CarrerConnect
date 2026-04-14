import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, FileText, Loader2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ApplicationStatus } from "../backend";
import type { ApplicationPublic, JobPublic, UserId } from "../backend.d.ts";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import {
  useApplicationsForMyJobs,
  useEmployerProfile,
  useJob,
  useMyApplications,
  useMyJobs,
  useUpdateApplicationStatus,
  useWithdrawApplication,
} from "../hooks/useQueries";
import { useUserType } from "../hooks/useUserType";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
}

const ALL_STATUSES = "all";
type StatusFilter = ApplicationStatus | typeof ALL_STATUSES;

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: ALL_STATUSES },
  { label: "Pending", value: ApplicationStatus.Pending },
  { label: "Viewed", value: ApplicationStatus.Viewed },
  { label: "Accepted", value: ApplicationStatus.Accepted },
  { label: "Rejected", value: ApplicationStatus.Rejected },
];

// ─── Company Name Cell ────────────────────────────────────────────────────────

function CompanyCell({ employerId }: { employerId: UserId }) {
  const { data: employer } = useEmployerProfile(employerId);
  if (!employer)
    return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <span className="text-sm text-foreground">{employer.companyName}</span>
  );
}

// ─── Applicant Name Cell (from job seeker profile — not exposed, show truncated principal) ────

function ApplicantCell({ applicantId }: { applicantId: UserId }) {
  const text = applicantId.toText();
  const short = `${text.slice(0, 5)}…${text.slice(-4)}`;
  return (
    <span className="font-mono text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">
      {short}
    </span>
  );
}

// ─── Status Dropdown (employer) ───────────────────────────────────────────────

function StatusDropdown({
  app,
  ocid,
}: {
  app: ApplicationPublic;
  ocid: string;
}) {
  const updateStatus = useUpdateApplicationStatus();

  async function onChange(value: string) {
    try {
      await updateStatus.mutateAsync({
        applicationId: app.id,
        status: value as ApplicationStatus,
      });
      toast.success("Status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  }

  return (
    <Select value={app.status} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs w-32" data-ocid={ocid}>
        <SelectValue />
        {updateStatus.isPending && (
          <Loader2 size={12} className="animate-spin ml-1 shrink-0" />
        )}
      </SelectTrigger>
      <SelectContent>
        {Object.values(ApplicationStatus).map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────

function TableSkeleton({ cols, rows = 5 }: { cols: number; rows?: number }) {
  const rowKeys = Array.from({ length: rows }, (_, i) => i);
  const colKeys = Array.from({ length: cols }, (_, j) => j);
  return (
    <div className="space-y-0">
      {rowKeys.map((i) => (
        <div
          key={`row-${i}`}
          className="flex items-center gap-4 px-4 py-3 border-b border-border"
        >
          {colKeys.map((j) => (
            <Skeleton key={`col-${j}`} className="h-4 flex-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Seeker Applications ──────────────────────────────────────────────────────

function SeekerApplications() {
  const { data: applications, isLoading } = useMyApplications();
  const withdraw = useWithdrawApplication();
  const [withdrawTarget, setWithdrawTarget] = useState<bigint | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_STATUSES);

  const filtered = useMemo(() => {
    if (!applications) return [];
    if (statusFilter === ALL_STATUSES) return applications;
    return applications.filter((a) => a.status === statusFilter);
  }, [applications, statusFilter]);

  async function handleWithdraw() {
    if (!withdrawTarget) return;
    try {
      await withdraw.mutateAsync(withdrawTarget);
      toast.success("Application withdrawn.");
    } catch {
      toast.error("Failed to withdraw application.");
    } finally {
      setWithdrawTarget(null);
    }
  }

  // Count per status for tab badges
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of applications ?? []) {
      map[a.status] = (map[a.status] ?? 0) + 1;
    }
    return map;
  }, [applications]);

  return (
    <div className="space-y-5" data-ocid="applications.page">
      {/* Status filter tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        data-ocid="applications.filter.tab"
      >
        <TabsList className="flex-wrap h-auto gap-1">
          {STATUS_OPTIONS.map(({ label, value }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="text-xs gap-1.5"
              data-ocid={`applications.filter.${value}`}
            >
              {label}
              {value !== ALL_STATUSES && counts[value] !== undefined && (
                <span className="bg-muted rounded-full px-1.5 py-px text-[10px] font-medium">
                  {counts[value]}
                </span>
              )}
              {value === ALL_STATUSES && applications !== undefined && (
                <span className="bg-muted rounded-full px-1.5 py-px text-[10px] font-medium">
                  {applications.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : filtered.length === 0 ? (
          <div className="py-2">
            <EmptyState
              icon={<FileText size={24} />}
              title={
                statusFilter === ALL_STATUSES
                  ? "No applications yet"
                  : `No ${statusFilter.toLowerCase()} applications`
              }
              description={
                statusFilter === ALL_STATUSES
                  ? "Browse open positions and apply to jobs that match your skills."
                  : "Try a different status filter."
              }
              ctaLabel={
                statusFilter === ALL_STATUSES ? "Browse Jobs" : undefined
              }
              ctaHref={statusFilter === ALL_STATUSES ? "/jobs" : undefined}
              dataOcid="applications.empty_state"
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Job Title
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Company
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Applied Date
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app: ApplicationPublic, i) => (
                <SeekerRow
                  key={app.id.toString()}
                  app={app}
                  index={i}
                  onWithdraw={() => setWithdrawTarget(app.id)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmDialog
        open={withdrawTarget !== null}
        onOpenChange={(open) => !open && setWithdrawTarget(null)}
        title="Withdraw Application"
        description="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmLabel="Withdraw"
        onConfirm={handleWithdraw}
        destructive
      />
    </div>
  );
}

function SeekerRow({
  app,
  index,
  onWithdraw,
}: {
  app: ApplicationPublic;
  index: number;
  onWithdraw: () => void;
}) {
  const { data: job } = useJob(app.jobId);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="group hover:bg-muted/30 transition-colors"
      data-ocid={`applications.item.${index + 1}`}
    >
      <TableCell>
        {job ? (
          <a
            href={`/jobs/${job.id}`}
            className="font-medium text-primary hover:underline transition-colors text-sm"
            data-ocid={`applications.item.${index + 1}.job_link`}
          >
            {job.title}
          </a>
        ) : (
          <Skeleton className="h-4 w-28" />
        )}
      </TableCell>
      <TableCell>
        {job ? (
          <CompanyCell employerId={job.employerId} />
        ) : (
          <Skeleton className="h-4 w-24" />
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(app.appliedAt)}
      </TableCell>
      <TableCell>
        <StatusBadge status={app.status} />
      </TableCell>
      <TableCell className="text-right">
        {app.status === ApplicationStatus.Pending && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive h-7 text-xs"
            onClick={onWithdraw}
            data-ocid={`applications.item.${index + 1}.withdraw_button`}
          >
            Withdraw
          </Button>
        )}
      </TableCell>
    </motion.tr>
  );
}

// ─── Employer Applications ────────────────────────────────────────────────────

function EmployerApplications() {
  const { data: applications, isLoading } = useApplicationsForMyJobs();
  const { data: myJobs } = useMyJobs();
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_STATUSES);

  const filtered = useMemo(() => {
    if (!applications) return [];
    return applications.filter((a) => {
      const jobMatch = jobFilter === "all" || a.jobId.toString() === jobFilter;
      const statusMatch =
        statusFilter === ALL_STATUSES || a.status === statusFilter;
      return jobMatch && statusMatch;
    });
  }, [applications, jobFilter, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of applications ?? []) {
      map[a.status] = (map[a.status] ?? 0) + 1;
    }
    return map;
  }, [applications]);

  return (
    <div className="space-y-5" data-ocid="applications.page">
      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Job filter */}
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger
            className="w-full sm:w-64 text-sm"
            data-ocid="applications.job_filter.select"
          >
            <SelectValue placeholder="Filter by job…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Job Posts</SelectItem>
            {(myJobs ?? []).map((job: JobPublic) => (
              <SelectItem key={job.id.toString()} value={job.id.toString()}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          className="flex-1"
          data-ocid="applications.filter.tab"
        >
          <TabsList className="flex-wrap h-auto gap-1">
            {STATUS_OPTIONS.map(({ label, value }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="text-xs gap-1.5"
                data-ocid={`applications.filter.${value}`}
              >
                {label}
                {value !== ALL_STATUSES && counts[value] !== undefined && (
                  <span className="bg-muted rounded-full px-1.5 py-px text-[10px] font-medium">
                    {counts[value]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton cols={5} />
        ) : filtered.length === 0 ? (
          <div className="py-2">
            <EmptyState
              icon={<Users size={24} />}
              title="No applications received"
              description={
                applications?.length === 0
                  ? "Applications will appear here once candidates apply to your jobs."
                  : "No applications match the selected filters."
              }
              dataOcid="applications.empty_state"
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Applicant
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Job Title
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Applied Date
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Update Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app: ApplicationPublic, i) => (
                <EmployerRow key={app.id.toString()} app={app} index={i} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function EmployerRow({
  app,
  index,
}: {
  app: ApplicationPublic;
  index: number;
}) {
  const { data: job } = useJob(app.jobId);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="hover:bg-muted/30 transition-colors"
      data-ocid={`applications.item.${index + 1}`}
    >
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <ApplicantCell applicantId={app.applicantId} />
          {app.coverLetter && (
            <p className="text-xs text-muted-foreground line-clamp-1 italic mt-1 max-w-[180px]">
              "{app.coverLetter}"
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        {job ? (
          <span className="text-sm font-medium text-foreground">
            {job.title}
          </span>
        ) : (
          <Skeleton className="h-4 w-28" />
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(app.appliedAt)}
      </TableCell>
      <TableCell>
        <StatusBadge status={app.status} />
      </TableCell>
      <TableCell>
        <StatusDropdown
          app={app}
          ocid={`applications.item.${index + 1}.status_select`}
        />
      </TableCell>
    </motion.tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const { isEmployer } = useUserType();

  return (
    <div>
      <PageHeader
        title={isEmployer ? "Manage Applications" : "My Applications"}
        subtitle={
          isEmployer
            ? "Review and update the status of received applications"
            : "Track the status of your job applications"
        }
        actions={
          isEmployer ? (
            <Badge
              variant="outline"
              className="text-xs gap-1.5 border-primary/30 text-primary"
            >
              <Briefcase size={12} />
              Employer View
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-xs gap-1.5 border-primary/30 text-primary"
            >
              <FileText size={12} />
              Job Seeker View
            </Badge>
          )
        }
      />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isEmployer ? <EmployerApplications /> : <SeekerApplications />}
      </div>
    </div>
  );
}
