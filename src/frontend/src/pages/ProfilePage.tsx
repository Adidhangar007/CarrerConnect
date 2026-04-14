import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Plus,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/PageHeader";
import {
  useMyEmployerProfile,
  useMyJobSeekerProfile,
  useUpsertEmployerProfile,
  useUpsertJobSeekerProfile,
} from "../hooks/useQueries";
import { useUserType } from "../hooks/useUserType";

// ─── Completion Indicator ──────────────────────────────────────────────────

interface CompletionProps {
  fields: { label: string; filled: boolean }[];
}

function ProfileCompletion({ fields }: CompletionProps) {
  const filled = fields.filter((f) => f.filled).length;
  const pct = Math.round((filled / fields.length) * 100);
  const color =
    pct < 40 ? "bg-destructive" : pct < 75 ? "bg-accent" : "bg-primary";

  return (
    <div
      className="bg-muted/50 border border-border rounded-xl p-4 mb-6"
      data-ocid="profile.completion_indicator"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          Profile Completion
        </span>
        <span className="text-sm font-semibold text-primary">{pct}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {fields.map((f) => (
          <span
            key={f.label}
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
              f.filled
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted border-border text-muted-foreground"
            }`}
          >
            {f.filled && <CheckCircle2 className="w-3 h-3" />}
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Skills Tag Input ──────────────────────────────────────────────────────

interface SkillsInputProps {
  value: string;
  onChange: (val: string) => void;
}

function SkillsTagInput({ value, onChange }: SkillsInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const tags = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function addTag(raw: string) {
    const newTags = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...tags, ...newTags]));
    onChange(merged.join(", "));
    setInput("");
  }

  function removeTag(tag: string) {
    const updated = tags.filter((t) => t !== tag).join(", ");
    onChange(updated);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div
      className="min-h-[44px] flex flex-wrap gap-1.5 items-center px-3 py-2 border border-input rounded-md bg-background cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0"
      onClick={() => inputRef.current?.focus()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.focus()}
      aria-label="Skills input container"
      data-ocid="profile.skills_input"
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs h-6">
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="rounded-full hover:bg-muted-foreground/20 p-0.5"
            aria-label={`Remove ${tag}`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={
          tags.length === 0 ? "Type a skill and press Enter…" : "Add more…"
        }
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
      {input.trim() && (
        <button
          type="button"
          onClick={() => addTag(input)}
          className="text-primary hover:text-primary/80"
          aria-label="Add skill"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ─── Job Seeker Form ───────────────────────────────────────────────────────

function JobSeekerProfile() {
  const { data: profile, isLoading } = useMyJobSeekerProfile();
  const upsert = useUpsertJobSeekerProfile();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    skills: "",
    yearsOfExperience: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        skills: profile.skills,
        yearsOfExperience: profile.yearsOfExperience.toString(),
      });
    }
  }, [profile]);

  const completionFields = [
    { label: "Name", filled: !!form.name.trim() },
    { label: "Email", filled: !!form.email.trim() },
    { label: "Phone", filled: !!form.phone.trim() },
    { label: "Skills", filled: !!form.skills.trim() },
    { label: "Experience", filled: !!form.yearsOfExperience },
    { label: "Bio", filled: !!form.bio.trim() },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await upsert.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        skills: form.skills.trim(),
        yearsOfExperience: BigInt(
          Math.max(0, Number.parseInt(form.yearsOfExperience) || 0),
        ),
      });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to save profile.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <Skeleton key={n} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
      data-ocid="profile.jobseeker_form"
    >
      <ProfileCompletion fields={completionFields} />

      <FormSection icon={User} title="Personal Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              data-ocid="profile.name_input"
            />
            <p className="text-xs text-muted-foreground">
              This is how employers will see you.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                className="pl-9"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                data-ocid="profile.email_input"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="+1 555 000 0000"
                className="pl-9"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                data-ocid="profile.phone_input"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Optional — only shown to employers you apply to.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="years">Years of Experience</Label>
            <Input
              id="years"
              type="number"
              min="0"
              max="50"
              placeholder="5"
              value={form.yearsOfExperience}
              onChange={(e) =>
                setForm((p) => ({ ...p, yearsOfExperience: e.target.value }))
              }
              data-ocid="profile.years_experience_input"
            />
            <p className="text-xs text-muted-foreground">
              Total professional experience in years.
            </p>
          </div>
        </div>
      </FormSection>

      <FormSection icon={CheckCircle2} title="Skills & Expertise">
        <div className="space-y-1.5">
          <Label htmlFor="skills">Skills</Label>
          <SkillsTagInput
            value={form.skills}
            onChange={(val) => setForm((p) => ({ ...p, skills: val }))}
          />
          <p className="text-xs text-muted-foreground">
            Type a skill and press Enter or comma to add it. These appear on
            your public profile and help employers find you.
          </p>
        </div>
      </FormSection>

      <FormSection icon={User} title="Bio">
        <div className="space-y-1.5">
          <Label htmlFor="bio">Professional Summary</Label>
          <Textarea
            id="bio"
            placeholder="Tell employers about yourself — your background, what you're passionate about, and the kind of role you're looking for…"
            rows={5}
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            data-ocid="profile.bio_textarea"
          />
          <p className="text-xs text-muted-foreground">
            A compelling summary increases your chances of being noticed.
          </p>
        </div>
      </FormSection>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Fields marked <span className="text-destructive">*</span> are
          required.
        </p>
        <Button
          type="submit"
          disabled={upsert.isPending}
          data-ocid="profile.save_button"
        >
          {upsert.isPending ? "Saving…" : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}

// ─── Company Card Preview ──────────────────────────────────────────────────

interface CompanyCardPreviewProps {
  companyName: string;
  description: string;
  websiteUrl: string;
}

function CompanyCardPreview({
  companyName,
  description,
  websiteUrl,
}: CompanyCardPreviewProps) {
  const initials = companyName
    ? companyName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "CO";

  return (
    <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-primary font-display">
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-foreground truncate font-display text-lg">
            {companyName || "Your Company Name"}
          </h4>
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
            >
              <Globe className="w-3 h-3" />
              {websiteUrl.replace(/^https?:\/\//, "")}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      {description ? (
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {description}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Your company description will appear here…
        </p>
      )}
      <div className="flex items-center gap-1.5 pt-1 border-t border-border">
        <Badge variant="secondary" className="text-xs">
          <Building2 className="w-3 h-3 mr-1" />
          Employer
        </Badge>
        <Badge
          variant="outline"
          className="text-xs text-primary border-primary/30"
        >
          Active
        </Badge>
      </div>
    </div>
  );
}

// ─── Employer Form ─────────────────────────────────────────────────────────

function EmployerProfile() {
  const { data: profile, isLoading } = useMyEmployerProfile();
  const upsert = useUpsertEmployerProfile();
  const [form, setForm] = useState({
    companyName: "",
    description: "",
    websiteUrl: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.companyName,
        description: profile.description,
        websiteUrl: profile.websiteUrl,
      });
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await upsert.mutateAsync({
        companyName: form.companyName.trim(),
        description: form.description.trim(),
        websiteUrl: form.websiteUrl.trim(),
      });
      toast.success("Company profile updated!");
    } catch {
      toast.error("Failed to save profile.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="profile.employer_form">
      <form onSubmit={handleSubmit} className="space-y-7">
        <FormSection icon={Building2} title="Company Information">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="Acme Corporation"
                value={form.companyName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, companyName: e.target.value }))
                }
                data-ocid="profile.company_name_input"
              />
              <p className="text-xs text-muted-foreground">
                Your official company name as it will appear on job listings.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  placeholder="https://acme.com"
                  className="pl-9"
                  value={form.websiteUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, websiteUrl: e.target.value }))
                  }
                  data-ocid="profile.website_input"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Candidates can visit your site to learn more about you.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">
                Company Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Tell candidates about your company — your mission, culture, team size, and what makes you a great place to work…"
                rows={6}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                data-ocid="profile.description_textarea"
              />
              <p className="text-xs text-muted-foreground">
                A detailed description helps attract the right talent. Aim for
                100–300 words.
              </p>
            </div>
          </div>
        </FormSection>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Fields marked <span className="text-destructive">*</span> are
            required.
          </p>
          <Button
            type="submit"
            disabled={upsert.isPending}
            data-ocid="profile.save_button"
          >
            {upsert.isPending ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </form>

      {/* Live card preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Company Card Preview
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <motion.div
          key={`${form.companyName}-${form.websiteUrl}`}
          initial={{ opacity: 0.7, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          data-ocid="profile.company_card_preview"
        >
          <CompanyCardPreview
            companyName={form.companyName}
            description={form.description}
            websiteUrl={form.websiteUrl}
          />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { isJobSeeker, isEmployer, isLoading } = useUserType();

  return (
    <div data-ocid="profile.page">
      <PageHeader
        title="My Profile"
        subtitle={
          isJobSeeker
            ? "Keep your profile up to date to stand out to employers"
            : "Showcase your company to attract top talent"
        }
      />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-2xl shadow-card p-6"
        >
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : isEmployer ? (
            <EmployerProfile />
          ) : (
            <JobSeekerProfile />
          )}
        </motion.div>
      </div>
    </div>
  );
}
