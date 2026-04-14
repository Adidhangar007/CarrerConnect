import Map "mo:core/Map";
import AppLib "../lib/applications";
import JobLib "../lib/jobs";
import AppTypes "../types/applications";
import JobTypes "../types/jobs";
import CommonTypes "../types/common";

mixin (
  applications : Map.Map<CommonTypes.ApplicationId, AppTypes.Application>,
  jobs : Map.Map<CommonTypes.JobId, JobTypes.Job>,
) {
  var nextApplicationId : Nat = 0;

  public shared ({ caller }) func submitApplication(
    input : AppTypes.SubmitApplicationInput
  ) : async CommonTypes.ApplicationId {
    let id = AppLib.submitApplication(applications, nextApplicationId, caller, input);
    nextApplicationId += 1;
    id;
  };

  public shared ({ caller }) func withdrawApplication(
    applicationId : CommonTypes.ApplicationId
  ) : async () {
    AppLib.withdrawApplication(applications, caller, applicationId);
  };

  public shared ({ caller }) func updateApplicationStatus(
    applicationId : CommonTypes.ApplicationId,
    status : CommonTypes.ApplicationStatus,
  ) : async () {
    let employerJobs = JobLib.listJobsByEmployer(jobs, caller);
    let jobIds = employerJobs.map(func(j : JobTypes.JobPublic) : CommonTypes.JobId { j.id });
    AppLib.updateApplicationStatus(applications, jobIds, caller, applicationId, status);
  };

  public shared query ({ caller }) func listMyApplications() : async [AppTypes.ApplicationPublic] {
    AppLib.listApplicationsForSeeker(applications, caller);
  };

  public shared query ({ caller }) func listApplicationsForMyJobs() : async [AppTypes.ApplicationPublic] {
    let employerJobs = JobLib.listJobsByEmployer(jobs, caller);
    let jobIds = employerJobs.map(func(j : JobTypes.JobPublic) : CommonTypes.JobId { j.id });
    AppLib.listApplicationsForEmployerJobs(applications, jobIds);
  };

  public query func listApplicationsForJob(jobId : CommonTypes.JobId) : async [AppTypes.ApplicationPublic] {
    AppLib.listApplicationsForJob(applications, jobId);
  };

  public shared query ({ caller }) func hasApplied(jobId : CommonTypes.JobId) : async Bool {
    AppLib.hasApplied(applications, caller, jobId);
  };
};
