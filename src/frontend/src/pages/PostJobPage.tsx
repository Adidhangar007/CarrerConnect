import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { DollarSign, MapPin, Plus, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { JobType } from "../backend";
import { PageHeader } from "../components/PageHeader";
import { useCreateJob, useMyJobs, useUpdateJob } from "../hooks/useQueries";

interface FormState {
  title: string;
  location: string;
  jobType: JobType;
  salaryMin: string;
  salaryMax: string;
  description: string;
  skillInput: string;
  skills: string[];
}

const INITIAL: FormState = {
  title: "",
  location: "",
  jobType: JobType.FullTime,
  salaryMin: "",
  salaryMax: "",
  description: "",
  skillInput: "",
  skills: [],
};

interface SearchParams {
  edit?: string;
}

export default function PostJobPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const skillInputRef = useRef<HTMLInputElement>(null);
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as SearchParams;
  const editJobId = search.edit ? BigInt(search.edit) : null;

  const { data: myJobs } = useMyJobs();

  // Populate form when editing
  useEffect(() => {
    if (!editJobId || !myJobs) return;
    const job = myJobs.find((j) => j.id === editJobId);
    if (!job) return;
    setForm({
      title: job.title,
      location: job.location,
      jobType: job.jobType,
      salaryMin: job.salaryMin.toString(),
      salaryMax: job.salaryMax.toString(),
      description: job.description,
      skillInput: "",
      skills: job.requiredSkills
        ? job.requiredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    });
  }, [editJobId, myJobs]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function addSkill() {
    const skill = form.skillInput.trim();
    if (!skill) return;
    const newSkills = skill
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !form.skills.includes(s));
    if (newSkills.length) {
      update("skills", [...form.skills, ...newSkills]);
    }
    update("skillInput", "");
    skillInputRef.current?.focus();
  }

  function removeSkill(skill: string) {
    update(
      "skills",
      form.skills.filter((s) => s !== skill),
    );
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    } else if (
      e.key === "Backspace" &&
      !form.skillInput &&
      form.skills.length
    ) {
      update("skills", form.skills.slice(0, -1));
    }
  }

  const salaryMinNum = Number(form.salaryMin);
  const salaryMaxNum = Number(form.salaryMax);
  const salaryRangeError =
    form.salaryMin && form.salaryMax && salaryMinNum >= salaryMaxNum;

  const isValid =
    form.title.trim() &&
    form.location.trim() &&
    form.description.trim() &&
    form.salaryMin &&
    form.salaryMax &&
    salaryMinNum > 0 &&
    salaryMaxNum > 0 &&
    salaryMinNum < salaryMaxNum;

  const isPending = createJob.isPending || updateJob.isPending;
  const isEditMode = editJobId !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Mark all fields touched on submit
    setTouched({
      title: true,
      location: true,
      description: true,
      salaryMin: true,
      salaryMax: true,
    });
    if (!isValid) return;

    const skillsStr = form.skills.join(", ");

    try {
      if (isEditMode && editJobId !== null) {
        await updateJob.mutateAsync({
          id: editJobId,
          title: form.title.trim(),
          location: form.location.trim(),
          jobType: form.jobType,
          salaryMin: BigInt(Math.round(salaryMinNum)),
          salaryMax: BigInt(Math.round(salaryMaxNum)),
          description: form.description.trim(),
          requiredSkills: skillsStr,
        });
        toast.success("Job updated successfully!");
      } else {
        await createJob.mutateAsync({
          title: form.title.trim(),
          location: form.location.trim(),
          jobType: form.jobType,
          salaryMin: BigInt(Math.round(salaryMinNum)),
          salaryMax: BigInt(Math.round(salaryMaxNum)),
          description: form.description.trim(),
          requiredSkills: skillsStr,
        });
        toast.success("Job posted successfully!");
      }
      navigate({ to: "/my-jobs" });
    } catch {
      toast.error(
        isEditMode
          ? "Failed to update job."
          : "Failed to post job. Please try again.",
      );
    }
  }

  return (
    <div data-ocid="post_job.page">
      <PageHeader
        title={isEditMode ? "Edit Job" : "Post a Job"}
        subtitle={
          isEditMode
            ? "Update the job listing details"
            : "Fill in the details to attract the best candidates"
        }
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl shadow-card p-6 md:p-8 space-y-6"
        >
          {/* Job Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Job Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Senior Software Engineer"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              onBlur={() => markTouched("title")}
              data-ocid="post_job.title_input"
            />
            {touched.title && !form.title.trim() && (
              <p
                className="text-xs text-destructive"
                data-ocid="post_job.title_input.field_error"
              >
                Job title is required.
              </p>
            )}
          </div>

          {/* Location + Job Type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">
                <MapPin size={13} className="inline mr-1 -mt-0.5" />
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g. New York, NY or Remote"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                onBlur={() => markTouched("location")}
                data-ocid="post_job.location_input"
              />
              {touched.location && !form.location.trim() && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="post_job.location_input.field_error"
                >
                  Location is required.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>
                Job Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.jobType}
                onValueChange={(v) => update("jobType", v as JobType)}
              >
                <SelectTrigger data-ocid="post_job.job_type_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JobType.FullTime}>Full-Time</SelectItem>
                  <SelectItem value={JobType.PartTime}>Part-Time</SelectItem>
                  <SelectItem value={JobType.Remote}>Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-1.5">
            <Label>
              <DollarSign size={13} className="inline mr-1 -mt-0.5" />
              Salary Range (USD / year){" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="salaryMin"
                type="number"
                min="0"
                placeholder="Min e.g. 80,000"
                value={form.salaryMin}
                onChange={(e) => update("salaryMin", e.target.value)}
                onBlur={() => markTouched("salaryMin")}
                className="flex-1"
                data-ocid="post_job.salary_min_input"
              />
              <span className="text-muted-foreground text-sm shrink-0">to</span>
              <Input
                id="salaryMax"
                type="number"
                min="0"
                placeholder="Max e.g. 120,000"
                value={form.salaryMax}
                onChange={(e) => update("salaryMax", e.target.value)}
                onBlur={() => markTouched("salaryMax")}
                className="flex-1"
                data-ocid="post_job.salary_max_input"
              />
            </div>
            {salaryRangeError && (
              <p
                className="text-xs text-destructive"
                data-ocid="post_job.salary_range.field_error"
              >
                Minimum salary must be less than maximum salary.
              </p>
            )}
            {touched.salaryMin && !form.salaryMin && (
              <p
                className="text-xs text-destructive"
                data-ocid="post_job.salary_min_input.field_error"
              >
                Salary range is required.
              </p>
            )}
          </div>

          {/* Required Skills */}
          <div className="space-y-1.5">
            <Label htmlFor="skill-input">Required Skills</Label>
            <p className="text-xs text-muted-foreground -mt-0.5">
              Type a skill and press Enter or comma to add it as a tag
            </p>
            {/* Tag display area */}
            <div
              className="min-h-[42px] flex flex-wrap gap-1.5 items-center border border-input rounded-md px-3 py-2 bg-background cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 transition-smooth"
              onClick={() => skillInputRef.current?.focus()}
              onKeyDown={() => skillInputRef.current?.focus()}
            >
              {form.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="gap-1 pr-1 text-xs font-medium select-none"
                  data-ocid="post_job.skill_tag"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSkill(skill);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        removeSkill(skill);
                      }
                    }}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={11} />
                  </button>
                </Badge>
              ))}
              <input
                ref={skillInputRef}
                id="skill-input"
                value={form.skillInput}
                onChange={(e) => update("skillInput", e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onBlur={addSkill}
                placeholder={
                  form.skills.length ? "" : "e.g. React, TypeScript, Node.js"
                }
                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                data-ocid="post_job.skills_input"
              />
            </div>
            {form.skillInput && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addSkill}
                className="h-7 gap-1 text-xs text-primary hover:text-primary"
              >
                <Plus size={12} /> Add "{form.skillInput.trim()}"
              </Button>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Job Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, requirements, and what you're offering…"
              rows={7}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              onBlur={() => markTouched("description")}
              data-ocid="post_job.description_textarea"
            />
            {touched.description && !form.description.trim() && (
              <p
                className="text-xs text-destructive"
                data-ocid="post_job.description_textarea.field_error"
              >
                Job description is required.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/my-jobs" })}
              data-ocid="post_job.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!!salaryRangeError || isPending}
              data-ocid="post_job.submit_button"
            >
              {isPending
                ? isEditMode
                  ? "Saving…"
                  : "Posting…"
                : isEditMode
                  ? "Save Changes"
                  : "Post Job"}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
