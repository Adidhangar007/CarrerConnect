import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  Clock,
  DollarSign,
  Edit2,
  MapPin,
  Plus,
  Power,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { JobStatus, JobType } from "../backend";
import type { JobPublic } from "../backend.d.ts";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PageHeader } from "../components/PageHeader";
import {
  useDeleteJob,
  useMyJobs,
  useToggleJobStatus,
} from "../hooks/useQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(min: bigint, max: bigint): string {
  const fmt = (n: bigint) => {
    const num = Number(n);
    return num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : `$${num}`;
  };
  return `${fmt(min)} – ${fmt(max)}`;
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JobType.FullTime]: "Full-Time",
  [JobType.PartTime]: "Part-Time",
  [JobType.Remote]: "Remote",
};

function JobTypePill({ type }: { type: JobType }) {
  const classMap: Record<JobType, string> = {
    [JobType.FullTime]: "bg-primary/10 text-primary border-primary/20",
    [JobType.PartTime]: "bg-accent/10 text-accent border-accent/20",
    [JobType.Remote]: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${classMap[type]}`}
    >
      {JOB_TYPE_LABELS[type]}
    </Badge>
  );
}

function StatusPill({ status }: { status: JobStatus }) {
  const isOpen = status === JobStatus.Open;
  return (
    <Badge
      variant="outline"
      className={
        isOpen
          ? "bg-chart-3/10 text-chart-3 border-chart-3/20 text-xs font-medium"
          : "bg-muted text-muted-foreground border-border text-xs font-medium"
      }
    >
      {isOpen ? "Open" : "Closed"}
    </Badge>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

interface JobRowProps {
  job: JobPublic;
  index: number;
  onToggle: (job: JobPublic) => void;
  onDelete: (job: JobPublic) => void;
  isTogglePending: boolean;
}

function JobRow({
  job,
  index,
  onToggle,
  onDelete,
  isTogglePending,
}: JobRowProps) {
  const navigate = useNavigate();
  const isOpen = job.status === JobStatus.Open;

  return (
    <TableRow
      className="hover:bg-muted/30 transition-colors"
      data-ocid={`my_jobs.item.${index + 1}`}
    >
      {/* Title */}
      <TableCell className="font-medium min-w-[180px]">
        <Link
          to="/jobs/$jobId"
          params={{ jobId: job.id.toString() }}
          className="hover:text-primary transition-colors line-clamp-2 font-display font-semibold text-sm"
          data-ocid={`my_jobs.item.${index + 1}.title_link`}
        >
          {job.title}
        </Link>
        {job.requiredSkills && (
          <div className="flex flex-wrap gap-1 mt-1">
            {job.requiredSkills
              .split(",")
              .slice(0, 3)
              .map((s) => (
                <Badge
                  key={s.trim()}
                  variant="secondary"
                  className="text-xs px-1.5 py-0"
                >
                  {s.trim()}
                </Badge>
              ))}
          </div>
        )}
      </TableCell>

      {/* Location */}
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        <span className="flex items-center gap-1">
          <MapPin size={12} className="shrink-0" />
          {job.location}
        </span>
      </TableCell>

      {/* Job Type */}
      <TableCell>
        <JobTypePill type={job.jobType} />
      </TableCell>

      {/* Salary */}
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        <span className="flex items-center gap-1">
          <DollarSign size={12} className="shrink-0" />
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <StatusPill status={job.status} />
      </TableCell>

      {/* Posted Date */}
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        <span className="flex items-center gap-1">
          <Clock size={12} className="shrink-0" />
          {formatDate(job.postedAt)}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-1">
          {/* Edit */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:text-primary"
            title="Edit job"
            onClick={() =>
              navigate({ to: "/post-job", search: { edit: job.id.toString() } })
            }
            data-ocid={`my_jobs.item.${index + 1}.edit_button`}
          >
            <Edit2 size={14} />
          </Button>

          {/* Toggle status */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${isOpen ? "hover:text-destructive" : "hover:text-chart-3"}`}
            title={isOpen ? "Close job" : "Reopen job"}
            onClick={() => onToggle(job)}
            disabled={isTogglePending}
            data-ocid={`my_jobs.item.${index + 1}.toggle_button`}
          >
            <Power size={14} />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:text-destructive"
            title="Delete job"
            onClick={() => onDelete(job)}
            data-ocid={`my_jobs.item.${index + 1}.delete_button`}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((n) => (
        <TableRow key={n}>
          {[180, 120, 90, 100, 70, 100, 80].map((w) => (
            <TableCell key={w}>
              <Skeleton className="h-4 rounded" style={{ width: w }} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function NoJobs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
      data-ocid="my_jobs.empty_state"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Briefcase size={28} className="text-muted-foreground" />
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-1">
        No jobs posted yet
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">
        Create your first job listing to start receiving applications from
        qualified candidates.
      </p>
      <Link to="/post-job">
        <Button
          className="gap-2"
          data-ocid="my_jobs.empty_state.post_job_button"
        >
          <Plus size={15} /> Post Your First Job
        </Button>
      </Link>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyJobsPage() {
  const { data: jobs, isLoading } = useMyJobs();
  const deleteJob = useDeleteJob();
  const toggleStatus = useToggleJobStatus();

  const [deleteTarget, setDeleteTarget] = useState<JobPublic | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteJob.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted.`);
    } catch {
      toast.error("Failed to delete job.");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleToggle(job: JobPublic) {
    const wasOpen = job.status === JobStatus.Open;
    try {
      await toggleStatus.mutateAsync(job.id);
      toast.success(
        wasOpen
          ? `"${job.title}" is now closed.`
          : `"${job.title}" is now open.`,
      );
    } catch {
      toast.error("Failed to update job status.");
    }
  }

  return (
    <div data-ocid="my_jobs.page">
      <PageHeader
        title="My Jobs"
        subtitle="Manage your posted positions"
        actions={
          <Link to="/post-job">
            <Button className="gap-2" data-ocid="my_jobs.post_job_button">
              <Plus size={16} /> Post New Job
            </Button>
          </Link>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
        >
          {/* Summary bar */}
          {!isLoading && jobs && jobs.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {jobs.length}
                </span>{" "}
                {jobs.length === 1 ? "job" : "jobs"} posted
                {" · "}
                <span className="text-chart-3 font-medium">
                  {jobs.filter((j) => j.status === JobStatus.Open).length} open
                </span>
                {" · "}
                <span className="text-muted-foreground">
                  {jobs.filter((j) => j.status === JobStatus.Closed).length}{" "}
                  closed
                </span>
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/20">
                  <TableHead className="font-semibold text-foreground">
                    Job Title
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Location
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Salary Range
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Posted
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : !jobs?.length ? null : (
                  jobs.map((job, i) => (
                    <JobRow
                      key={job.id.toString()}
                      job={job}
                      index={i}
                      onToggle={handleToggle}
                      onDelete={setDeleteTarget}
                      isTogglePending={toggleStatus.isPending}
                    />
                  ))
                )}
              </TableBody>
            </Table>

            {!isLoading && !jobs?.length && <NoJobs />}
          </div>
        </motion.div>
      </div>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Job Listing"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}" and all associated applications. This action cannot be undone.`
            : "This will permanently delete this job listing and all associated applications. This action cannot be undone."
        }
        confirmLabel="Delete Job"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
