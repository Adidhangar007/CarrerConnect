import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { UserType } from "../backend";
import { APP_NAME } from "../config";
import { useAuth } from "../hooks/useAuth";
import { useUserType } from "../hooks/useUserType";

const YEAR = new Date().getFullYear();
const FOOTER_LINK = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
  typeof window !== "undefined" ? window.location.hostname : "",
)}`;

interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, principalText, logout } = useAuth();
  const { isJobSeeker, isEmployer, isAdmin, userType } = useUserType();
  const location = useLocation();

  const seekerLinks: NavLink[] = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={16} />,
    },
    { to: "/jobs", label: "Browse Jobs", icon: <Briefcase size={16} /> },
    { to: "/applications", label: "My Applications", icon: <User size={16} /> },
    { to: "/profile", label: "Profile", icon: <Settings size={16} /> },
  ];

  const employerLinks: NavLink[] = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={16} />,
    },
    { to: "/post-job", label: "Post Job", icon: <Briefcase size={16} /> },
    { to: "/my-jobs", label: "My Jobs", icon: <Building2 size={16} /> },
    {
      to: "/applications",
      label: "Manage Applications",
      icon: <User size={16} />,
    },
    { to: "/profile", label: "Profile", icon: <Settings size={16} /> },
  ];

  const adminLinks: NavLink[] = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={16} />,
    },
    { to: "/admin", label: "Admin Panel", icon: <Shield size={16} /> },
  ];

  const publicLinks: NavLink[] = [
    { to: "/jobs", label: "Browse Jobs", icon: <Briefcase size={16} /> },
  ];

  let navLinks: NavLink[];
  if (isAdmin) navLinks = adminLinks;
  else if (isEmployer) navLinks = employerLinks;
  else if (isJobSeeker) navLinks = seekerLinks;
  else navLinks = publicLinks;

  const initials = principalText
    ? principalText.slice(0, 2).toUpperCase()
    : "?";
  const roleLabel = isAdmin
    ? "Administrator"
    : userType === UserType.Employer
      ? "Employer"
      : userType === UserType.JobSeeker
        ? "Job Seeker"
        : "Guest";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            data-ocid="nav.logo_link"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase size={16} className="text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              {APP_NAME}
            </span>
          </Link>

          {/* Nav Links */}
          {isAuthenticated && (
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-ocid={`nav.${link.label.toLowerCase().replace(/\s+/g, "_")}_link`}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-3 ml-auto">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9"
                    data-ocid="nav.user_menu_button"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                      {roleLabel}
                    </span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52"
                  data-ocid="nav.user_dropdown_menu"
                >
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground truncate">
                      {principalText}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="cursor-pointer"
                      data-ocid="nav.profile_link"
                    >
                      <User size={14} className="mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive cursor-pointer"
                    data-ocid="nav.logout_button"
                  >
                    <LogOut size={14} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm" data-ocid="nav.login_button">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <Briefcase size={10} className="text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {APP_NAME}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {YEAR}.{" "}
            <a
              href={FOOTER_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
