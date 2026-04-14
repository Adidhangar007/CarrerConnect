import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { JobType } from "../backend";
import type { JobPublic } from "../backend.d.ts";
import { EmptyState } from "../components/EmptyState";
import { JobCard } from "../components/JobCard";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { useOpenJobs } from "../hooks/useQueries";

const PAGE_SIZE = 12;

const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: JobType.FullTime, label: "Full-Time" },
  { value: JobType.PartTime, label: "Part-Time" },
  { value: JobType.Remote, label: "Remote" },
];

export default function JobsPage() {
  const { data: jobs, isLoading } = useOpenJobs();
  const { isAuthenticated } = useAuth();

  const [search, setSearch] = useState("");
  const [typeFilters, setTypeFilters] = useState<Set<JobType>>(new Set());
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleType = (type: JobType) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    setPage(1);
  };

  const clearAll = () => {
    setSearch("");
    setTypeFilters(new Set());
    setPage(1);
  };

  const hasFilters = search.trim().length > 0 || typeFilters.size > 0;

  const filtered = useMemo(() => {
    return (jobs ?? []).filter((job: JobPublic) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.requiredSkills.toLowerCase().includes(q);
      const matchesType =
        typeFilters.size === 0 || typeFilters.has(job.jobType);
      return matchesSearch && matchesType;
    });
  }, [jobs, search, typeFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageJobs = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const FilterSidebar = () => (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-card border border-border rounded-xl p-5 sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-semibold text-sm text-foreground uppercase tracking-wide">
            Filters
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1"
              data-ocid="jobs.clear_filters_button"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>

        <Separator className="mb-4" />

        {/* Job Type */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Job Type
          </p>
          <div className="space-y-2.5">
            {JOB_TYPE_OPTIONS.map(({ value, label }) => (
              <div key={value} className="flex items-center gap-2.5">
                <Checkbox
                  id={`type-${value}`}
                  checked={typeFilters.has(value)}
                  onCheckedChange={() => toggleType(value)}
                  data-ocid={`jobs.filter.type_${value.toLowerCase()}`}
                />
                <Label
                  htmlFor={`type-${value}`}
                  className="text-sm text-foreground cursor-pointer font-normal"
                >
                  {label}
                </Label>
                <span className="ml-auto text-xs text-muted-foreground">
                  {(jobs ?? []).filter((j) => j.jobType === value).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {typeFilters.size > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {Array.from(typeFilters).map((t) => {
              const opt = JOB_TYPE_OPTIONS.find((o) => o.value === t);
              return (
                <Badge
                  key={t}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => toggleType(t)}
                >
                  {opt?.label ?? t}
                  <X size={10} className="ml-1" />
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div data-ocid="jobs.page">
      <PageHeader
        title="Browse Jobs"
        subtitle={`${filtered.length} of ${jobs?.length ?? 0} positions`}
      />

      {/* Search Bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-xl">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="Search by title, skill, or location…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
                data-ocid="jobs.search_input"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden flex items-center gap-2"
              onClick={() => setSidebarOpen((v) => !v)}
              data-ocid="jobs.mobile_filter_toggle"
            >
              <SlidersHorizontal size={14} />
              Filters
              {typeFilters.size > 0 && (
                <Badge className="h-4 min-w-4 px-1 text-[10px]">
                  {typeFilters.size}
                </Badge>
              )}
            </Button>
          </div>

          {hasFilters && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing {filtered.length} result
              {filtered.length !== 1 ? "s" : ""}
              {search && (
                <span>
                  {" "}
                  for &ldquo;
                  <span className="font-medium text-foreground">{search}</span>
                  &rdquo;
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Sign-in prompt for unauthenticated */}
      {!isAuthenticated && (
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-foreground">
              <span className="font-medium">Find your next opportunity.</span>{" "}
              Sign in to apply to jobs and track your applications.
            </p>
            <Link to="/login">
              <Button
                size="sm"
                className="shrink-0 flex items-center gap-1.5"
                data-ocid="jobs.signin_prompt_button"
              >
                <LogIn size={14} />
                Sign in to apply
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-foreground/20 z-30"
            role="button"
            tabIndex={0}
            aria-label="Close filters"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-background z-40 overflow-y-auto p-5 shadow-elevated border-l border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold text-foreground">
                Filters
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>

          {/* Job Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((k) => (
                  <Skeleton key={k} className="h-52 rounded-xl" />
                ))}
              </div>
            ) : pageJobs.length === 0 ? (
              <EmptyState
                icon={<Briefcase size={24} />}
                title={
                  hasFilters
                    ? "No matching jobs found"
                    : "No open positions yet"
                }
                description={
                  hasFilters
                    ? "Try adjusting your search or removing filters."
                    : "Check back soon — new positions are posted regularly."
                }
                ctaLabel={hasFilters ? "Clear Filters" : undefined}
                onCta={hasFilters ? clearAll : undefined}
                dataOcid="jobs.empty_state"
              />
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {pageJobs.map((job, i) => (
                    <motion.div
                      key={job.id.toString()}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.35) }}
                    >
                      <JobCard
                        job={job}
                        index={pageStart + i}
                        showSignInPrompt={!isAuthenticated}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    className="mt-8 flex items-center justify-between"
                    data-ocid="jobs.pagination"
                  >
                    <p className="text-sm text-muted-foreground">
                      Page {safePage} of {totalPages} &middot; {filtered.length}{" "}
                      jobs
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage <= 1}
                        className="flex items-center gap-1"
                        data-ocid="jobs.pagination_prev"
                      >
                        <ChevronLeft size={14} />
                        Previous
                      </Button>

                      {/* Page number pills */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, idx) => {
                            const pageNum =
                              totalPages <= 5
                                ? idx + 1
                                : safePage <= 3
                                  ? idx + 1
                                  : safePage >= totalPages - 2
                                    ? totalPages - 4 + idx
                                    : safePage - 2 + idx;
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setPage(pageNum)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && setPage(pageNum)
                                }
                                className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                                  pageNum === safePage
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                                data-ocid={`jobs.pagination.page_${pageNum}`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={safePage >= totalPages}
                        className="flex items-center gap-1"
                        data-ocid="jobs.pagination_next"
                      >
                        Next
                        <ChevronRight size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
