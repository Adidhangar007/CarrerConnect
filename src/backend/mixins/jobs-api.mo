import Map "mo:core/Map";
import JobLib "../lib/jobs";
import JobTypes "../types/jobs";
import CommonTypes "../types/common";

mixin (
  jobs : Map.Map<CommonTypes.JobId, JobTypes.Job>,
) {
  var nextJobId : Nat = 0;

  public shared ({ caller }) func createJob(
    input : JobTypes.CreateJobInput
  ) : async CommonTypes.JobId {
    let id = JobLib.createJob(jobs, nextJobId, caller, input);
    nextJobId += 1;
    id;
  };

  public query func getJob(jobId : CommonTypes.JobId) : async ?JobTypes.JobPublic {
    JobLib.getJob(jobs, jobId);
  };

  public shared ({ caller }) func updateJob(input : JobTypes.UpdateJobInput) : async () {
    JobLib.updateJob(jobs, caller, input);
  };

  public shared ({ caller }) func deleteJob(jobId : CommonTypes.JobId) : async () {
    JobLib.deleteJob(jobs, caller, jobId);
  };

  public query func listOpenJobs() : async [JobTypes.JobPublic] {
    JobLib.listOpenJobs(jobs);
  };

  public shared query ({ caller }) func listMyJobs() : async [JobTypes.JobPublic] {
    JobLib.listJobsByEmployer(jobs, caller);
  };

  public shared ({ caller }) func toggleJobStatus(jobId : CommonTypes.JobId) : async () {
    JobLib.toggleJobStatus(jobs, caller, jobId);
  };
};
