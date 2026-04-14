import type { backendInterface } from "../backend";
import {
  ApplicationStatus,
  JobStatus,
  JobType,
  UserType,
} from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const mockPrincipal = Principal.fromText("aaaaa-aa");
const now = BigInt(Date.now()) * BigInt(1_000_000);

export const mockBackend: backendInterface = {
  adminGetStats: async () => ({
    totalEmployers: BigInt(12),
    totalJobSeekers: BigInt(87),
    totalJobs: BigInt(34),
    totalApplications: BigInt(210),
  }),

  adminListEmployers: async () => [
    {
      id: mockPrincipal,
      companyName: "TechCorp Solutions",
      description: "Leading software development firm.",
      websiteUrl: "https://techcorp.example.com",
      createdAt: now,
    },
    {
      id: mockPrincipal,
      companyName: "InnovateCo",
      description: "Innovative product design company.",
      websiteUrl: "https://innovateco.example.com",
      createdAt: now,
    },
  ],

  adminListJobSeekers: async () => [
    {
      id: mockPrincipal,
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 9876543210",
      bio: "Full stack developer with 5 years experience.",
      skills: "React, TypeScript, Node.js",
      yearsOfExperience: BigInt(5),
      createdAt: now,
    },
    {
      id: mockPrincipal,
      name: "Amit Verma",
      email: "amit.verma@example.com",
      phone: "+91 9123456789",
      bio: "Mobile developer specializing in Flutter.",
      skills: "Flutter, Dart, Firebase",
      yearsOfExperience: BigInt(3),
      createdAt: now,
    },
  ],

  createJob: async (_input) => BigInt(1),

  deleteJob: async (_jobId) => undefined,

  getEmployerProfile: async (_userId) => ({
    id: mockPrincipal,
    companyName: "TechCorp Solutions",
    description: "Leading software development firm specializing in enterprise solutions.",
    websiteUrl: "https://techcorp.example.com",
    createdAt: now,
  }),

  getJob: async (_jobId) => ({
    id: BigInt(1),
    title: "Senior React Developer",
    description: "We are looking for a skilled React developer to join our growing team. You will work on cutting-edge web applications.",
    location: "Bangalore, India",
    jobType: JobType.FullTime,
    salaryMin: BigInt(1200000),
    salaryMax: BigInt(2000000),
    requiredSkills: "React, TypeScript, Node.js, REST APIs",
    status: JobStatus.Open,
    employerId: mockPrincipal,
    postedAt: now,
  }),

  getJobSeekerProfile: async (_userId) => ({
    id: mockPrincipal,
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 9876543210",
    bio: "Full stack developer with 5 years of experience building scalable web applications.",
    skills: "React, TypeScript, Node.js, PostgreSQL",
    yearsOfExperience: BigInt(5),
    createdAt: now,
  }),

  getMyEmployerProfile: async () => null,

  getMyJobSeekerProfile: async () => null,

  getMyUserType: async () => null,

  getUserType: async (_userId) => UserType.JobSeeker,

  hasApplied: async (_jobId) => false,

  listApplicationsForJob: async (_jobId) => [
    {
      id: BigInt(1),
      jobId: BigInt(1),
      applicantId: mockPrincipal,
      coverLetter: "I am excited about this opportunity and believe my skills align perfectly with your requirements.",
      status: ApplicationStatus.Pending,
      appliedAt: now,
    },
  ],

  listApplicationsForMyJobs: async () => [
    {
      id: BigInt(1),
      jobId: BigInt(1),
      applicantId: mockPrincipal,
      coverLetter: "I am excited about this opportunity.",
      status: ApplicationStatus.Pending,
      appliedAt: now,
    },
  ],

  listMyApplications: async () => [
    {
      id: BigInt(1),
      jobId: BigInt(1),
      applicantId: mockPrincipal,
      coverLetter: "I am excited about this role.",
      status: ApplicationStatus.Pending,
      appliedAt: now,
    },
  ],

  listMyJobs: async () => [
    {
      id: BigInt(1),
      title: "Senior React Developer",
      description: "We are looking for a skilled React developer to join our growing team.",
      location: "Bangalore, India",
      jobType: JobType.FullTime,
      salaryMin: BigInt(1200000),
      salaryMax: BigInt(2000000),
      requiredSkills: "React, TypeScript, Node.js",
      status: JobStatus.Open,
      employerId: mockPrincipal,
      postedAt: now,
    },
  ],

  listOpenJobs: async () => [
    {
      id: BigInt(1),
      title: "Senior React Developer",
      description: "We are looking for a skilled React developer to join our growing team. You will work on cutting-edge web applications and collaborate with cross-functional teams.",
      location: "Bangalore, India",
      jobType: JobType.FullTime,
      salaryMin: BigInt(1200000),
      salaryMax: BigInt(2000000),
      requiredSkills: "React, TypeScript, Node.js, REST APIs",
      status: JobStatus.Open,
      employerId: mockPrincipal,
      postedAt: now,
    },
    {
      id: BigInt(2),
      title: "UI/UX Designer",
      description: "Create beautiful, intuitive user interfaces for our flagship SaaS products.",
      location: "Mumbai, India",
      jobType: JobType.Remote,
      salaryMin: BigInt(800000),
      salaryMax: BigInt(1400000),
      requiredSkills: "Figma, Adobe XD, CSS, User Research",
      status: JobStatus.Open,
      employerId: mockPrincipal,
      postedAt: now,
    },
    {
      id: BigInt(3),
      title: "Backend Engineer (Node.js)",
      description: "Build and maintain robust APIs and microservices for our growing platform.",
      location: "Hyderabad, India",
      jobType: JobType.FullTime,
      salaryMin: BigInt(1000000),
      salaryMax: BigInt(1800000),
      requiredSkills: "Node.js, PostgreSQL, Docker, AWS",
      status: JobStatus.Open,
      employerId: mockPrincipal,
      postedAt: now,
    },
    {
      id: BigInt(4),
      title: "Data Analyst",
      description: "Analyze complex datasets and deliver actionable insights to product teams.",
      location: "Remote",
      jobType: JobType.PartTime,
      salaryMin: BigInt(600000),
      salaryMax: BigInt(1000000),
      requiredSkills: "Python, SQL, Tableau, Excel",
      status: JobStatus.Open,
      employerId: mockPrincipal,
      postedAt: now,
    },
  ],

  setUserType: async (_userType) => undefined,

  submitApplication: async (_input) => BigInt(1),

  toggleJobStatus: async (_jobId) => undefined,

  updateApplicationStatus: async (_applicationId, _status) => undefined,

  updateJob: async (_input) => undefined,

  upsertEmployerProfile: async (_input) => undefined,

  upsertJobSeekerProfile: async (_input) => undefined,

  withdrawApplication: async (_applicationId) => undefined,
};
