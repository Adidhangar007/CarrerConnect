import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { JobCard } from "../components/JobCard";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import {
  useAdminStats,
  useApplicationsForMyJobs,
  useJob,
  useMyApplications,
  useMyJobs,
  useOpenJobs,
} from "../hooks/useQueries";
import { useUserType } from "../hooks/useUserType";

function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <Card className="border-border shadow-card">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="font-display text-2xl font-bold text-foreground">
              {value}
            </p>
            {trend && <p className="text-xs text-chart-3 mt-0.5">{trend}</p>}
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationRow({
  app,
  index,
}: {
  app: { id: bigint; jobId: bigint; status: string };
  index: number;
}) {
  const { data: job } = useJob(app.jobId);
  return (
    <div
      key={app.id.toString()}
      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
      data-ocid={`dashboard.application.${index + 1}`}
    >
      <div>
        <p className="font-medium text-sm text-foreground">
          {job ? job.title : `Job #${app.jobId.toString()}`}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Clock size={11} /> Applied recently
        </p>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          app.status === "Accepted"
            ? "bg-chart-3/10 text-chart-3"
            : app.status === "Rejected"
              ? "bg-destructive/10 text-destructive"
              : app.status === "Viewed"
                ? "bg-primary/10 text-primary"
                : "bg-accent/10 text-accent"
        }`}
      >
        {app.status}
      </span>
    </div>
  );
}

function JobSeekerDashboard() {
  const { data: jobs, isLoading: jobsLoading } = useOpenJobs();
  const { data: applications, isLoading: appsLoading } = useMyApplications();

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Open Jobs"
          value={jobs?.length ?? "—"}
          icon={<Briefcase size={18} />}
        />
        <StatCard
          label="My Applications"
          value={applications?.length ?? "—"}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Profile Views"
          value="—"
          icon={<TrendingUp size={18} />}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Recent Opportunities
        </h2>
        <Link to="/jobs">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            data-ocid="dashboard.browse_all_button"
          >
            Browse All <ArrowRight size={14} />
          </Button>
        </Link>
      </div>

      {jobsLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {(jobs ?? []).slice(0, 4).map((job, i) => (
            <motion.div
              key={job.id.toString()}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <JobCard job={job} index={i} />
            </motion.div>
          ))}
        </div>
      )}

      {!jobsLoading && !appsLoading && (applications?.length ?? 0) > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              My Applications
            </h2>
            <Link to="/applications">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                data-ocid="dashboard.my_applications_button"
              >
                View All <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {(applications ?? []).slice(0, 3).map((app, i) => (
              <ApplicationRow key={app.id.toString()} app={app} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmployerDashboard() {
  const { data: myJobs, isLoading: jobsLoading } = useMyJobs();
  const { data: applications } = useApplicationsForMyJobs();

  const openJobs = myJobs?.filter((j) => j.status === "Open") ?? [];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Active Jobs"
          value={openJobs.length}
          icon={<Briefcase size={18} />}
          trend={`${myJobs?.length ?? 0} total`}
        />
        <StatCard
          label="Applications"
          value={applications?.length ?? "—"}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Total Jobs"
          value={myJobs?.length ?? "—"}
          icon={<Building2 size={18} />}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          My Job Listings
        </h2>
        <div className="flex gap-2">
          <Link to="/post-job">
            <Button
              size="sm"
              className="gap-1"
              data-ocid="dashboard.post_job_button"
            >
              + Post Job
            </Button>
          </Link>
          <Link to="/my-jobs">
            <Button
              variant="outline"
              size="sm"
              data-ocid="dashboard.view_all_jobs_button"
            >
              View All
            </Button>
          </Link>
        </div>
      </div>

      {jobsLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <Skeleton key={n} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {(myJobs ?? []).slice(0, 4).map((job, i) => (
            <motion.div
              key={job.id.toString()}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <JobCard
                job={job}
                index={i}
                showActions
                actions={
                  <div className="flex gap-2 flex-1">
                    <Link to="/applications" className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        data-ocid={`dashboard.job.${i + 1}.applications_button`}
                      >
                        Applications
                      </Button>
                    </Link>
                    <Link to="/my-jobs" className="flex-1">
                      <Button
                        size="sm"
                        className="w-full"
                        data-ocid={`dashboard.job.${i + 1}.manage_button`}
                      >
                        Manage
                      </Button>
                    </Link>
                  </div>
                }
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          [1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Job Seekers"
              value={stats?.totalJobSeekers?.toString() ?? "0"}
              icon={<Users size={18} />}
            />
            <StatCard
              label="Total Employers"
              value={stats?.totalEmployers?.toString() ?? "0"}
              icon={<Building2 size={18} />}
            />
          </>
        )}
      </div>
      <Link to="/admin">
        <Button data-ocid="dashboard.admin_panel_button">
          Go to Admin Panel
        </Button>
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { principalText } = useAuth();
  const { isJobSeeker, isEmployer, isAdmin, isLoading } = useUserType();

  const firstName = principalText
    ? `User ${principalText.slice(0, 6)}`
    : "there";

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${firstName}!`}
        actions={
          isEmployer ? (
            <Link to="/post-job">
              <Button data-ocid="dashboard.header_post_job_button">
                + Post New Job
              </Button>
            </Link>
          ) : isJobSeeker ? (
            <Link to="/jobs">
              <Button
                variant="outline"
                data-ocid="dashboard.header_browse_jobs_button"
              >
                Browse Jobs
              </Button>
            </Link>
          ) : null
        }
      />

      <div className="container mx-auto px-4 py-8" data-ocid="dashboard.page">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : isAdmin ? (
          <AdminDashboard />
        ) : isEmployer ? (
          <EmployerDashboard />
        ) : (
          <JobSeekerDashboard />
        )}
      </div>
    </div>
  );
}
