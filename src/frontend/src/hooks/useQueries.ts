import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  ApplicationId,
  ApplicationStatus,
  CreateJobInput,
  JobId,
  SubmitApplicationInput,
  UpdateJobInput,
  UpsertEmployerInput,
  UpsertJobSeekerInput,
  UserId,
} from "../backend.d.ts";
import { useAuth } from "./useAuth";

function useActorQuery() {
  return useActor(createActor);
}

// ─── Auth / User Type ────────────────────────────────────────────────────────

export function useGetMyUserType() {
  const { actor, isFetching } = useActorQuery();
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["myUserType"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyUserType();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 30_000,
  });
}

// ─── Job Seeker Profile ──────────────────────────────────────────────────────

export function useMyJobSeekerProfile() {
  const { actor, isFetching } = useActorQuery();
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["myJobSeekerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyJobSeekerProfile();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useUpsertJobSeekerProfile() {
  const { actor } = useActorQuery();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertJobSeekerInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.upsertJobSeekerProfile(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myJobSeekerProfile"] });
      qc.invalidateQueries({ queryKey: ["myUserType"] });
    },
  });
}

// ─── Employer Profile ────────────────────────────────────────────────────────

export function useMyEmployerProfile() {
  const { actor, isFetching } = useActorQuery();
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["myEmployerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyEmployerProfile();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useUpsertEmployerProfile() {
  const { actor } = useActorQuery();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertEmployerInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.upsertEmployerProfile(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myEmployerProfile"] });
      qc.invalidateQueries({ queryKey: ["myUserType"] });
    },
  });
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export function useOpenJobs() {
  const { actor, isFetching } = useActorQuery();
  return useQuery({
    queryKey: ["openJobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOpenJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEmployerProfile(userId: UserId | null) {
  const { actor, isFetching } = useActorQuery();
  return useQuery({
    queryKey: ["employerProfile", userId?.toText()],
    queryFn: async () => {
      if (!actor || userId === null) return null;
      return actor.getEmployerProfile(userId);
    },
    enabled: !!actor && !isFetching && userId !== null,
    staleTime: 60_000,
  });
}

export function useJob(jobId: JobId | null) {
  const { actor, isFetching } = useActorQuery();
  return useQuery({
    queryKey: ["job", jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return null;
      return actor.getJob(jobId);
    },
    enabled: !!actor && !isFetching && jobId !== null,
  });
}

export function useMyJobs() {
  const { actor, isFetching } = useActorQuery();
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["myJobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyJobs();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useCreateJob() {
  const { actor } = useActorQuery();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateJobInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createJob(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myJobs"] });
      qc.invalidateQueries({ queryKey: ["openJobs"] });
    },
  });
}

export function useUpdateJob() {
  const { actor } = useActorQuery();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateJobInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateJob(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myJobs"] });
      qc.invalidateQueries({ queryKey: ["openJobs"] });
    },
  });
}

export function useDeleteJob() {
  const { actor } = useActorQuery();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: JobId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteJob(jobId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myJobs"] });
      qc.invalidateQueries({ queryKey: ["openJobs"] });
    },
  });
}

export function useToggleJobStatus() {
  const { actor } = useActorQuery();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: JobId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleJobStatus(jobId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myJobs"] });
      qc.invalidateQueries({ queryKey: ["openJobs"] });
    },
  });
}

// ─── Applications ────────────────────────────────────────────────────────────

export function useHasApplied(jobId: JobId | null) {
  const { actor, isFetching } = useActorQuery();
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["hasApplied", jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return false;
      return actor.hasApplied(jobId);
    },
    enabled: !!actor && !isFetching && jobId !== null && isAuthenticated,
    staleTime: 10_000,
  });
}

export function useMyApplications() {
  const { actor, isFetching } = useActorQuery();
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["myApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyApplications();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useApplicationsForMyJobs() {
  const { actor, isFetching } = useActorQuery();
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["applicationsForMyJobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApplicationsForMyJobs();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useApplicationsForJob(jobId: JobId | null) {
  const { actor, isFetching } = useActorQuery();
  return useQuery({
    queryKey: ["applicationsForJob", jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return [];
      return actor.listApplicationsForJob(jobId);
    },
    enabled: !!actor && !isFetching && jobId !== null,
  });
}

export function useSubmitApplication() {
  const { actor } = useActorQuery();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SubmitApplicationInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitApplication(input);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["myApplications"] });
      qc.invalidateQueries({
        queryKey: ["hasApplied", variables.jobId.toString()],
      });
    },
  });
}

export function useWithdrawApplication() {
  const { actor } = useActorQuery();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appId: ApplicationId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.withdrawApplication(appId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActorQuery();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
    }: {
      applicationId: ApplicationId;
      status: ApplicationStatus;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateApplicationStatus(applicationId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applicationsForMyJobs"] });
    },
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useAdminStats() {
  const { actor, isFetching } = useActorQuery();
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.adminGetStats();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useAdminJobSeekers() {
  const { actor, isFetching } = useActorQuery();
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["adminJobSeekers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListJobSeekers();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useAdminEmployers() {
  const { actor, isFetching } = useActorQuery();
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["adminEmployers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListEmployers();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}
