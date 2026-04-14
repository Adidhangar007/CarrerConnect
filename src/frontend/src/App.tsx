import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import {
  Outlet,
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import { PageLoader } from "./components/LoadingSpinner";
import { useAuth } from "./hooks/useAuth";
import { useUserType } from "./hooks/useUserType";
import AdminPage from "./pages/AdminPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import DashboardPage from "./pages/DashboardPage";
import JobDetailPage from "./pages/JobDetailPage";
import JobsPage from "./pages/JobsPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MyJobsPage from "./pages/MyJobsPage";
import PostJobPage from "./pages/PostJobPage";
import ProfilePage from "./pages/ProfilePage";
import SelectRolePage from "./pages/SelectRolePage";

// ─── Root ──────────────────────────────────────────────────────────────────

function RootComponent() {
  return (
    <Layout>
      <Outlet />
      <Toaster position="bottom-right" richColors />
    </Layout>
  );
}

const rootRoute = createRootRoute({ component: RootComponent });

// ─── Auth Guard Component ──────────────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const { userType, isLoading } = useUserType();

  if (isInitializing || isLoading) {
    return <PageLoader label="Checking authentication…" />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (userType === null) {
    return <SelectRolePage />;
  }

  return <>{children}</>;
}

// ─── Routes ───────────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const selectRoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/select-role",
  component: SelectRolePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  ),
});

const jobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs",
  component: JobsPage,
});

const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs/$jobId",
  component: JobDetailPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  ),
});

const postJobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post-job",
  component: () => (
    <AuthGuard>
      <PostJobPage />
    </AuthGuard>
  ),
});

const myJobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-jobs",
  component: () => (
    <AuthGuard>
      <MyJobsPage />
    </AuthGuard>
  ),
});

const applicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/applications",
  component: () => (
    <AuthGuard>
      <ApplicationsPage />
    </AuthGuard>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AuthGuard>
      <AdminPage />
    </AuthGuard>
  ),
});

// ─── Router ───────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  selectRoleRoute,
  dashboardRoute,
  jobsRoute,
  jobDetailRoute,
  profileRoute,
  postJobRoute,
  myJobsRoute,
  applicationsRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
