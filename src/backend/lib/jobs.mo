import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import JobTypes "../types/jobs";
import CommonTypes "../types/common";

module {
  public type UserId = CommonTypes.UserId;
  public type JobId = CommonTypes.JobId;
  public type Job = JobTypes.Job;
  public type JobPublic = JobTypes.JobPublic;
  public type CreateJobInput = JobTypes.CreateJobInput;
  public type UpdateJobInput = JobTypes.UpdateJobInput;
  public type JobStatus = CommonTypes.JobStatus;

  public func toPublic(job : Job) : JobPublic {
    {
      id = job.id;
      title = job.title;
      description = job.description;
      requiredSkills = job.requiredSkills;
      location = job.location;
      salaryMin = job.salaryMin;
      salaryMax = job.salaryMax;
      jobType = job.jobType;
      status = job.status;
      employerId = job.employerId;
      postedAt = job.postedAt;
    };
  };

  public func createJob(
    jobs : Map.Map<JobId, Job>,
    nextId : Nat,
    caller : UserId,
    input : CreateJobInput,
  ) : Nat {
    let job : Job = {
      id = nextId;
      var title = input.title;
      var description = input.description;
      var requiredSkills = input.requiredSkills;
      var location = input.location;
      var salaryMin = input.salaryMin;
      var salaryMax = input.salaryMax;
      var jobType = input.jobType;
      var status = #Open;
      employerId = caller;
      postedAt = Time.now();
    };
    jobs.add(nextId, job);
    nextId;
  };

  public func getJob(
    jobs : Map.Map<JobId, Job>,
    jobId : JobId,
  ) : ?JobPublic {
    switch (jobs.get(jobId)) {
      case (?j) ?toPublic(j);
      case null null;
    };
  };

  public func updateJob(
    jobs : Map.Map<JobId, Job>,
    caller : UserId,
    input : UpdateJobInput,
  ) {
    switch (jobs.get(input.id)) {
      case (?job) {
        if (not Principal.equal(job.employerId, caller)) {
          Runtime.trap("Not authorized: caller is not the job owner");
        };
        job.title := input.title;
        job.description := input.description;
        job.requiredSkills := input.requiredSkills;
        job.location := input.location;
        job.salaryMin := input.salaryMin;
        job.salaryMax := input.salaryMax;
        job.jobType := input.jobType;
      };
      case null Runtime.trap("Job not found");
    };
  };

  public func deleteJob(
    jobs : Map.Map<JobId, Job>,
    caller : UserId,
    jobId : JobId,
  ) {
    switch (jobs.get(jobId)) {
      case (?job) {
        if (not Principal.equal(job.employerId, caller)) {
          Runtime.trap("Not authorized: caller is not the job owner");
        };
        jobs.remove(jobId);
      };
      case null Runtime.trap("Job not found");
    };
  };

  public func listOpenJobs(jobs : Map.Map<JobId, Job>) : [JobPublic] {
    jobs.values()
      .filter(func(j : Job) : Bool { j.status == #Open })
      .map(func(j : Job) : JobPublic { toPublic(j) })
      .toArray();
  };

  public func listJobsByEmployer(
    jobs : Map.Map<JobId, Job>,
    employerId : UserId,
  ) : [JobPublic] {
    jobs.values()
      .filter(func(j : Job) : Bool { Principal.equal(j.employerId, employerId) })
      .map(func(j : Job) : JobPublic { toPublic(j) })
      .toArray();
  };

  public func toggleJobStatus(
    jobs : Map.Map<JobId, Job>,
    caller : UserId,
    jobId : JobId,
  ) {
    switch (jobs.get(jobId)) {
      case (?job) {
        if (not Principal.equal(job.employerId, caller)) {
          Runtime.trap("Not authorized: caller is not the job owner");
        };
        job.status := switch (job.status) {
          case (#Open) #Closed;
          case (#Closed) #Open;
        };
      };
      case null Runtime.trap("Job not found");
    };
  };
};
