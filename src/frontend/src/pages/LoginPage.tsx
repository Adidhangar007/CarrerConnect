import { Button } from "@/components/ui/button";
import { Briefcase, Lock } from "lucide-react";
import { motion } from "motion/react";
import { APP_NAME } from "../config";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, isInitializing, loginStatus } = useAuth();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-elevated p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5">
            <Briefcase size={28} className="text-primary-foreground" />
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Sign in to {APP_NAME}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Use Internet Identity — a secure, privacy-preserving login powered
            by the Internet Computer.
          </p>

          <Button
            size="lg"
            className="w-full gap-2 h-12 text-base"
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            data-ocid="login.sign_in_button"
          >
            <Lock size={18} />
            {isLoggingIn
              ? "Opening Internet Identity…"
              : "Sign in with Internet Identity"}
          </Button>

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-muted-foreground">
              No password required. Your identity is cryptographically secured.{" "}
              <a
                href="https://identity.ic0.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By signing in, you agree to our terms of service.
        </p>
      </motion.div>
    </div>
  );
}
