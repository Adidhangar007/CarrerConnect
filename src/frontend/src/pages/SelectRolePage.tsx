import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Briefcase, Building2, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useUpsertJobSeekerProfile } from "../hooks/useQueries";
import { useUpsertEmployerProfile } from "../hooks/useQueries";

type RoleChoice = "seeker" | "employer" | null;

export default function SelectRolePage() {
  const [selected, setSelected] = useState<RoleChoice>(null);
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const upsertSeeker = useUpsertJobSeekerProfile();
  const upsertEmployer = useUpsertEmployerProfile();

  async function handleConfirm() {
    if (!selected) return;
    setConfirming(true);
    try {
      if (selected === "seeker") {
        await upsertSeeker.mutateAsync({
          name: "",
          email: "",
          phone: "",
          bio: "",
          skills: "",
          yearsOfExperience: 0n,
        });
      } else {
        await upsertEmployer.mutateAsync({
          companyName: "",
          description: "",
          websiteUrl: "",
        });
      }
      qc.invalidateQueries({ queryKey: ["myUserType"] });
      toast.success(
        `You're registered as a${selected === "employer" ? "n Employer" : " Job Seeker"}!`,
      );
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to set role. Please try again.");
      setConfirming(false);
    }
  }

  const roles = [
    {
      id: "seeker" as const,
      icon: <Briefcase size={32} />,
      title: "Job Seeker",
      description:
        "Browse thousands of open positions, build your profile, and apply to jobs that match your skills.",
      highlights: [
        "Discover opportunities",
        "One-click applications",
        "Track application status",
      ],
    },
    {
      id: "employer" as const,
      icon: <Building2 size={32} />,
      title: "Employer",
      description:
        "Post job listings, review candidate applications, and connect with top talent quickly and efficiently.",
      highlights: [
        "Post unlimited jobs",
        "Manage applications",
        "View candidate profiles",
      ],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">
            How will you use CareerConnect?
          </h1>
          <p className="text-muted-foreground">
            Choose your role to personalize your experience.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {roles.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(role.id)}
              data-ocid={`select_role.${role.id}_card`}
              className={`relative text-left p-6 rounded-2xl border-2 transition-smooth cursor-pointer ${
                selected === role.id
                  ? "border-primary bg-primary/5 shadow-elevated"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-card"
              }`}
            >
              {selected === role.id && (
                <CheckCircle
                  size={20}
                  className="absolute top-4 right-4 text-primary"
                />
              )}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  selected === role.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {role.icon}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {role.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {role.description}
              </p>
              <ul className="space-y-1.5">
                {role.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="px-10"
            disabled={!selected || confirming}
            onClick={handleConfirm}
            data-ocid="select_role.confirm_button"
          >
            {confirming ? "Setting up your account…" : "Continue →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
