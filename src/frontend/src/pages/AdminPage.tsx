import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Search,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import type {
  EmployerProfilePublic,
  JobSeekerProfilePublic,
} from "../backend.d.ts";
import { useAuth } from "../hooks/useAuth";
import {
  useAdminEmployers,
  useAdminJobSeekers,
  useAdminStats,
} from "../hooks/useQueries";

const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: bigint | undefined;
  icon: React.ReactNode;
  iconBg: string;
  loading: boolean;
  ocid: string;
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  loading,
  ocid,
}: StatCardProps) {
  return (
    <Card data-ocid={ocid}>
      <CardContent className="pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-display font-bold text-foreground">
                {value?.toString() ?? "—"}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  prefix: string;
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  prefix,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
          data-ocid={`${prefix}.pagination_prev`}
        >
          <ChevronLeft size={14} />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
          data-ocid={`${prefix}.pagination_next`}
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

// ─── Job Seekers Tab ──────────────────────────────────────────────────────────

function JobSeekersTab({
  data,
  isLoading,
}: {
  data: JobSeekerProfilePublic[];
  isLoading: boolean;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = data.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          className="pl-9"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          data-ocid="admin.seekers.search_input"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold w-[180px]">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Skills</TableHead>
                <TableHead className="font-semibold">Bio</TableHead>
                <TableHead className="font-semibold text-right whitespace-nowrap">
                  Joined
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                ["sk1", "sk2", "sk3", "sk4", "sk5"].map((id) => (
                  <TableRow key={id} data-ocid="admin.seekers.loading_state">
                    {["a", "b", "c", "d", "e", "f"].map((col) => (
                      <TableCell key={`${id}-${col}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-14 text-center"
                    data-ocid="admin.seekers.empty_state"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users size={32} className="opacity-30" />
                      <p className="font-medium">No job seekers found</p>
                      <p className="text-sm">
                        {search
                          ? "Try a different search term"
                          : "No job seekers have registered yet"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((seeker, idx) => {
                  const rowIdx = (page - 1) * PAGE_SIZE + idx + 1;
                  const skillList = seeker.skills
                    ? seeker.skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [];
                  return (
                    <TableRow
                      key={seeker.id.toText()}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`admin.seekers.item.${rowIdx}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {(seeker.name || "?").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-sm truncate max-w-[120px]">
                            {seeker.name || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {seeker.email || (
                          <span className="italic opacity-40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {seeker.phone || (
                          <span className="italic opacity-40">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {skillList.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {skillList.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs px-1.5 py-0"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {skillList.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0 text-muted-foreground"
                              >
                                +{skillList.length - 3}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-sm opacity-40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[220px]">
                        {seeker.bio ? (
                          <span title={seeker.bio}>
                            {truncate(seeker.bio, 60)}
                          </span>
                        ) : (
                          <span className="italic opacity-40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(seeker.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
          prefix="admin.seekers"
        />
      </Card>
    </div>
  );
}

// ─── Companies Tab ────────────────────────────────────────────────────────────

function CompaniesTab({
  data,
  isLoading,
}: {
  data: EmployerProfilePublic[];
  isLoading: boolean;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = data.filter((e) =>
    e.companyName.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          className="pl-9"
          placeholder="Search by company name…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          data-ocid="admin.companies.search_input"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold w-[200px]">
                  Company
                </TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Website</TableHead>
                <TableHead className="font-semibold text-right whitespace-nowrap">
                  Joined
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                ["co1", "co2", "co3", "co4", "co5"].map((id) => (
                  <TableRow key={id} data-ocid="admin.companies.loading_state">
                    {["a", "b", "c", "d"].map((col) => (
                      <TableCell key={`${id}-${col}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-14 text-center"
                    data-ocid="admin.companies.empty_state"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 size={32} className="opacity-30" />
                      <p className="font-medium">No companies found</p>
                      <p className="text-sm">
                        {search
                          ? "Try a different search term"
                          : "No employers have registered yet"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((emp, idx) => {
                  const rowIdx = (page - 1) * PAGE_SIZE + idx + 1;
                  const href = emp.websiteUrl
                    ? emp.websiteUrl.startsWith("http")
                      ? emp.websiteUrl
                      : `https://${emp.websiteUrl}`
                    : null;
                  return (
                    <TableRow
                      key={emp.id.toText()}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`admin.companies.item.${rowIdx}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <Building2 size={14} className="text-accent" />
                          </div>
                          <span className="font-medium text-sm truncate max-w-[140px]">
                            {emp.companyName || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[280px]">
                        {emp.description ? (
                          <span title={emp.description}>
                            {truncate(emp.description, 80)}
                          </span>
                        ) : (
                          <span className="italic opacity-40">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-primary hover:underline text-sm"
                            data-ocid={`admin.companies.website_link.${rowIdx}`}
                          >
                            <ExternalLink size={13} />
                            {truncate(
                              emp.websiteUrl.replace(/^https?:\/\//, ""),
                              30,
                            )}
                          </a>
                        ) : (
                          <span className="italic text-sm opacity-40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(emp.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
          prefix="admin.companies"
        />
      </Card>
    </div>
  );
}

// ─── Access Denied ────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4"
      data-ocid="admin.access_denied"
    >
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <Shield size={28} className="text-destructive" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-2xl font-display font-bold text-foreground">
          Access Denied
        </h2>
        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
          You don't have permission to view this page. This area is restricted
          to platform administrators only.
        </p>
      </div>
      <Badge variant="destructive" className="px-3 py-1 text-sm font-medium">
        Admin Access Required
      </Badge>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { isAdmin } = useAuth();

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: seekers = [], isLoading: seekersLoading } =
    useAdminJobSeekers();
  const { data: employers = [], isLoading: employersLoading } =
    useAdminEmployers();

  if (!isAdmin) return <AccessDenied />;

  const statCards = [
    {
      label: "Total Job Seekers",
      value: stats?.totalJobSeekers,
      icon: <Users size={18} className="text-primary" />,
      iconBg: "bg-primary/10",
      ocid: "admin.stat_card.job_seekers",
    },
    {
      label: "Total Employers",
      value: stats?.totalEmployers,
      icon: <Building2 size={18} className="text-accent" />,
      iconBg: "bg-accent/10",
      ocid: "admin.stat_card.employers",
    },
    {
      label: "Total Jobs",
      value: stats?.totalJobs,
      icon: <Briefcase size={18} className="text-chart-3" />,
      iconBg: "bg-chart-3/10",
      ocid: "admin.stat_card.jobs",
    },
    {
      label: "Total Applications",
      value: stats?.totalApplications,
      icon: <FileText size={18} className="text-chart-2" />,
      iconBg: "bg-chart-2/10",
      ocid: "admin.stat_card.applications",
    },
  ];

  return (
    <div className="bg-background min-h-screen" data-ocid="admin.page">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Shield size={18} className="text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
                Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Platform oversight &amp; user management
              </p>
            </div>
            <Badge className="ml-auto hidden sm:flex items-center gap-1.5 text-xs bg-primary/10 text-primary border-primary/30 hover:bg-primary/10">
              <UserCheck size={12} />
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
        <section data-ocid="admin.stats_section">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Platform Overview
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                iconBg={card.iconBg}
                loading={statsLoading}
                ocid={card.ocid}
              />
            ))}
          </div>
        </section>

        {/* ── Tabs ────────────────────────────────────────────────────────────── */}
        <section data-ocid="admin.users_section">
          <Tabs defaultValue="seekers">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                User Management
              </p>
              <TabsList data-ocid="admin.users_tabs">
                <TabsTrigger value="seekers" data-ocid="admin.tab.seekers">
                  <Users size={14} className="mr-1.5" />
                  Job Seekers
                  {!seekersLoading && (
                    <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5 py-0 font-mono leading-5">
                      {seekers.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="companies" data-ocid="admin.tab.companies">
                  <Building2 size={14} className="mr-1.5" />
                  Companies
                  {!employersLoading && (
                    <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5 py-0 font-mono leading-5">
                      {employers.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="seekers" data-ocid="admin.seekers.panel">
              <JobSeekersTab data={seekers} isLoading={seekersLoading} />
            </TabsContent>
            <TabsContent value="companies" data-ocid="admin.companies.panel">
              <CompaniesTab data={employers} isLoading={employersLoading} />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
