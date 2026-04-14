import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CreateJobInput {
    title: string;
    jobType: JobType;
    description: string;
    salaryMax: bigint;
    salaryMin: bigint;
    requiredSkills: string;
    location: string;
}
export interface UpdateJobInput {
    id: JobId;
    title: string;
    jobType: JobType;
    description: string;
    salaryMax: bigint;
    salaryMin: bigint;
    requiredSkills: string;
    location: string;
}
export type Timestamp = bigint;
export interface SubmitApplicationInput {
    jobId: JobId;
    coverLetter: string;
}
export interface EmployerProfilePublic {
    id: UserId;
    websiteUrl: string;
    createdAt: Timestamp;
    description: string;
    companyName: string;
}
export type JobId = bigint;
export interface UpsertEmployerInput {
    websiteUrl: string;
    description: string;
    companyName: string;
}
export interface UpsertJobSeekerInput {
    bio: string;
    yearsOfExperience: bigint;
    name: string;
    email: string;
    phone: string;
    skills: string;
}
export type UserId = Principal;
export interface JobSeekerProfilePublic {
    id: UserId;
    bio: string;
    yearsOfExperience: bigint;
    name: string;
    createdAt: Timestamp;
    email: string;
    phone: string;
    skills: string;
}
export interface JobPublic {
    id: JobId;
    status: JobStatus;
    title: string;
    postedAt: Timestamp;
    jobType: JobType;
    description: string;
    employerId: UserId;
    salaryMax: bigint;
    salaryMin: bigint;
    requiredSkills: string;
    location: string;
}
export interface ApplicationPublic {
    id: ApplicationId;
    status: ApplicationStatus;
    appliedAt: Timestamp;
    applicantId: UserId;
    jobId: JobId;
    coverLetter: string;
}
export type ApplicationId = bigint;
export enum ApplicationStatus {
    Viewed = "Viewed",
    Rejected = "Rejected",
    Accepted = "Accepted",
    Pending = "Pending"
}
export enum JobStatus {
    Open = "Open",
    Closed = "Closed"
}
export enum JobType {
    PartTime = "PartTime",
    Remote = "Remote",
    FullTime = "FullTime"
}
export enum UserType {
    JobSeeker = "JobSeeker",
    Employer = "Employer"
}
export interface backendInterface {
    adminGetStats(): Promise<{
        totalEmployers: bigint;
        totalJobSeekers: bigint;
        totalJobs: bigint;
        totalApplications: bigint;
    }>;
    adminListEmployers(): Promise<Array<EmployerProfilePublic>>;
    adminListJobSeekers(): Promise<Array<JobSeekerProfilePublic>>;
    createJob(input: CreateJobInput): Promise<JobId>;
    deleteJob(jobId: JobId): Promise<void>;
    getEmployerProfile(userId: UserId): Promise<EmployerProfilePublic | null>;
    getJob(jobId: JobId): Promise<JobPublic | null>;
    getJobSeekerProfile(userId: UserId): Promise<JobSeekerProfilePublic | null>;
    getMyEmployerProfile(): Promise<EmployerProfilePublic | null>;
    getMyJobSeekerProfile(): Promise<JobSeekerProfilePublic | null>;
    getMyUserType(): Promise<UserType | null>;
    getUserType(userId: UserId): Promise<UserType | null>;
    hasApplied(jobId: JobId): Promise<boolean>;
    listApplicationsForJob(jobId: JobId): Promise<Array<ApplicationPublic>>;
    listApplicationsForMyJobs(): Promise<Array<ApplicationPublic>>;
    listMyApplications(): Promise<Array<ApplicationPublic>>;
    listMyJobs(): Promise<Array<JobPublic>>;
    listOpenJobs(): Promise<Array<JobPublic>>;
    setUserType(userType: UserType): Promise<void>;
    submitApplication(input: SubmitApplicationInput): Promise<ApplicationId>;
    toggleJobStatus(jobId: JobId): Promise<void>;
    updateApplicationStatus(applicationId: ApplicationId, status: ApplicationStatus): Promise<void>;
    updateJob(input: UpdateJobInput): Promise<void>;
    upsertEmployerProfile(input: UpsertEmployerInput): Promise<void>;
    upsertJobSeekerProfile(input: UpsertJobSeekerInput): Promise<void>;
    withdrawApplication(applicationId: ApplicationId): Promise<void>;
}
