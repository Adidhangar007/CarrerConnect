import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import ProfileLib "../lib/profiles";
import ProfileTypes "../types/profiles";
import JobTypes "../types/jobs";
import AppTypes "../types/applications";
import CommonTypes "../types/common";

mixin (
  jobSeekers : Map.Map<CommonTypes.UserId, ProfileTypes.JobSeekerProfile>,
  employers : Map.Map<CommonTypes.UserId, ProfileTypes.EmployerProfile>,
  jobs : Map.Map<CommonTypes.JobId, JobTypes.Job>,
  applications : Map.Map<CommonTypes.ApplicationId, AppTypes.Application>,
) {
  let ADMIN_PRINCIPAL = "admin-principal-placeholder";

  func assertAdmin(caller : CommonTypes.UserId) {
    if (caller.toText() != ADMIN_PRINCIPAL) {
      Runtime.trap("Not authorized: admin only");
    };
  };

  public shared ({ caller }) func adminListJobSeekers() : async [ProfileTypes.JobSeekerProfilePublic] {
    assertAdmin(caller);
    ProfileLib.listJobSeekers(jobSeekers);
  };

  public shared ({ caller }) func adminListEmployers() : async [ProfileTypes.EmployerProfilePublic] {
    assertAdmin(caller);
    ProfileLib.listEmployers(employers);
  };

  public shared ({ caller }) func adminGetStats() : async {
    totalJobSeekers : Nat;
    totalEmployers : Nat;
    totalJobs : Nat;
    totalApplications : Nat;
  } {
    assertAdmin(caller);
    {
      totalJobSeekers = jobSeekers.size();
      totalEmployers = employers.size();
      totalJobs = jobs.size();
      totalApplications = applications.size();
    };
  };
};
