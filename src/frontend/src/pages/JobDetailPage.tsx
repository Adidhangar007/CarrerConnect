import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Globe,
  Lock,
  MapPin,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { JobStatus, JobType } from "../backend";
import { useAuth } from "../hooks/useAuth";
import {
  useEmployerProfile,
  useHasApplied,
  useJob,
  useSubmitApplication,
} from "../hooks/useQueries";
import { useUserType } from "../hooks/useUserType";

// ─── Constants ──────────────────────────────────────────────────────────────

const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JobType.FullTime]: "Full-Time",
  [JobType.PartTime]: "Part-Time",
  [JobType.Remote]: "Remote",
};

const MIN_COVER_LETTER = 50;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatSalary(min: bigint, max: bigint) {
  const fmt = (n: bigint) => {
    const num = Number(n);
    return num >= 1000 ? `$${Math.round(num / 1000)}k` : `$${num}`;
  };
  return `${fmt(min)} – ${fmt(max)}/yr`;
}

function timeAgo(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  const days = Math.floor((Date.now() - ms) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function MetaItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      className="container mx-auto px-4 py-8 max-w-3xl"
      data-ocid="job_detail.loading_state"
    >
      <Skeleton className="h-5 w-28 mb-8" />
      <Skeleton className="h-52 rounded-2xl mb-5" />
      <Skeleton className="h-40 rounded-2xl mb-5" />
      <Skeleton className="h-28 rounded-2xl" />
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { jobId } = useParams({ from: "/jobs/$jobId" });
  const jobIdBig = BigInt(jobId);

  const { data: job, isLoading: jobLoading } = useJob(jobIdBig);
  const { data: employer, isLoading: employerLoading } = useEmployerProfile(
    job?.employerId ?? null,
  );
  const { isAuthenticated, login, loginStatus } = useAuth();
  const { isJobSeeker, isEmployer, isAdmin } = useUserType();
  const { data: alreadyApplied, isLoading: appliedLoading } = useHasApplied(
    isAuthenticated && isJobSeeker ? jobIdBig : null,
  );
  const submitApp = useSubmitApplication();

  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const isLoading = jobLoading;
  const isClosed = job?.status === JobStatus.Closed;
  const charCount = coverLetter.length;
  const charOk = charCount >= MIN_COVER_LETTER;

  // ─── Apply handler ──────────────────────────────────────────────────────

  async function handleApply() {
    if (!charOk) {
      toast.error(`Please write at least ${MIN_COVER_LETTER} characters.`);
      return;
    }
    try {
      await submitApp.mutateAsync({ jobId: jobIdBig, coverLetter });
      toast.success("Application submitted! Good luck 🎉");
      setApplyOpen(false);
      setCoverLetter("");
    } catch {
      toast.error("Failed to submit. You may have already applied.");
    }
  }

  // ─── Loading ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  // ─── Not found ──────────────────────────────────────────────────────────

  if (!job) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center gap-4 py-24">
        <Briefcase size={40} className="text-muted-foreground/40" />
        <p className="text-muted-foreground font-medium">Job not found.</p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          data-ocid="job_detail.back_button"
        >
          <ArrowLeft size={15} className="mr-1.5" /> Back to Jobs
        </Button>
      </div>
    );
  }

  // ─── CTA Block ──────────────────────────────────────────────────────────

  const showApplyBtn = isJobSeeker && !isClosed && !appliedLoading;
  const canShowEmployerNoApply = isEmployer || isAdmin;

  function CtaSection() {
    if (!isAuthenticated) {
      return (
        <div
          className="mt-5 flex items-center gap-3 rounded-xl bg-muted/50 border border-border px-4 py-3"
          data-ocid="job_detail.unauthenticated_cta"
        >
          <Lock size={16} className="text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground flex-1">
            Sign in to apply for this role.
          </span>
          <Button
            size="sm"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            data-ocid="job_detail.login_to_apply_button"
          >
            {loginStatus === "logging-in" ? "Signing in…" : "Sign In"}
          </Button>
        </div>
      );
    }

    if (isClosed) {
      return (
        <div className="mt-5">
          <Badge
            variant="outline"
            className="border-destructive/30 text-destructive text-sm px-3 py-1"
          >
            This position is closed
          </Badge>
        </div>
      );
    }

    if (alreadyApplied) {
      return (
        <div
          className="mt-5 flex items-center gap-2"
          data-ocid="job_detail.already_applied_badge"
        >
          <CheckCircle2 size={18} className="text-chart-3" />
          <Badge
            variant="outline"
            className="bg-chart-3/10 text-chart-3 border-chart-3/20 text-sm px-3 py-1"
          >
            Already Applied
          </Badge>
        </div>
      );
    }

    if (showApplyBtn) {
      return (
        <div className="mt-5">
          <Button
            className="gap-2 transition-smooth"
            onClick={() => setApplyOpen(true)}
            data-ocid="job_detail.apply_button"
          >
            <Send size={15} /> Apply Now
          </Button>
        </div>
      );
    }

    if (canShowEmployerNoApply) {
      return null;
    }

    return null;
  }

  const companyName = employerLoading
    ? "Loading…"
    : (employer?.companyName ?? "Company");
  const companyWebsite = employer?.websiteUrl ?? null;

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="bg-background min-h-screen">
      {/* Top bar */}
      <div className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/90">
        <div className="container mx-auto px-4 py-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="job_detail.back_button"
          >
            <ArrowLeft size={15} /> Back to Jobs
          </button>
        </div>
      </div>

      <div
        className="container mx-auto px-4 py-8 max-w-3xl"
        data-ocid="job_detail.page"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-5"
        >
          {/* ── Header Card ─────────────────────────────────────────────── */}
          <div
            className="bg-card border border-border rounded-2xl p-6 shadow-card"
            data-ocid="job_detail.header_card"
          >
            {/* Icon + Badges row */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/15">
                <Briefcase size={24} className="text-primary" />
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <Badge
                  variant="outline"
                  className={
                    isClosed
                      ? "border-destructive/30 text-destructive bg-destructive/5"
                      : "bg-chart-3/10 text-chart-3 border-chart-3/20"
                  }
                >
                  {isClosed ? "Closed" : "Open"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                </Badge>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl font-bold text-foreground mb-2 leading-tight">
              {job.title}
            </h1>

            {/* Company row */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5">
              <Building2 size={14} className="shrink-0" />
              <span className="font-medium text-foreground">{companyName}</span>
              {companyWebsite && (
                <a
                  href={companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-0.5 text-primary hover:underline"
                  data-ocid="job_detail.company_website_link"
                >
                  <Globe size={12} />
                  <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-t border-b border-border">
              <MetaItem icon={<MapPin size={14} />} label={job.location} />
              <MetaItem
                icon={<DollarSign size={14} />}
                label={formatSalary(job.salaryMin, job.salaryMax)}
              />
              <MetaItem
                icon={<Clock size={14} />}
                label={`Posted ${timeAgo(job.postedAt)}`}
              />
            </div>

            {/* CTA */}
            <CtaSection />
          </div>

          {/* ── Description ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-card"
            data-ocid="job_detail.description_card"
          >
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              About the Role
            </h2>
            <h3 className="font-display text-lg font-semibold text-foreground mb-3">
              Job Description
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </motion.div>

          {/* ── Skills ──────────────────────────────────────────────────── */}
          {job.requiredSkills?.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-card"
              data-ocid="job_detail.skills_card"
            >
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      {skill}
                    </Badge>
                  ))}
              </div>
            </motion.div>
          )}

          {/* ── Company Info ─────────────────────────────────────────────── */}
          {employer && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="bg-muted/30 border border-border rounded-2xl p-6"
              data-ocid="job_detail.company_card"
            >
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                About the Company
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/15">
                  <Building2 size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {employer.companyName}
                  </p>
                  {employer.websiteUrl && (
                    <a
                      href={employer.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {employer.websiteUrl}
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
              {employer.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {employer.description}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Apply Dialog ───────────────────────────────────────────────────── */}
      <Dialog
        open={applyOpen}
        onOpenChange={(open) => {
          setApplyOpen(open);
          if (!open) setCoverLetter("");
        }}
      >
        <DialogContent
          className="sm:max-w-lg"
          data-ocid="job_detail.apply_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Apply for <span className="text-primary">{job.title}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div>
              <Label
                htmlFor="cover-letter"
                className="mb-1.5 block text-sm font-medium"
              >
                Cover Letter
              </Label>
              <Textarea
                id="cover-letter"
                placeholder="Tell the employer why you're a great fit for this role…"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={7}
                className="resize-none"
                data-ocid="job_detail.cover_letter_textarea"
              />
              <div className="flex justify-between items-center mt-1.5">
                <p
                  className={`text-xs ${
                    charOk ? "text-chart-3" : "text-muted-foreground"
                  }`}
                >
                  {charOk
                    ? `✓ ${charCount} characters`
                    : `${charCount}/${MIN_COVER_LETTER} minimum characters`}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setApplyOpen(false);
                setCoverLetter("");
              }}
              data-ocid="job_detail.cancel_apply_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={submitApp.isPending || !charOk}
              className="gap-2"
              data-ocid="job_detail.submit_application_button"
            >
              {submitApp.isPending ? (
                <>Submitting…</>
              ) : (
                <>
                  <Send size={14} /> Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
