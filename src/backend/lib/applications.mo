import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AppTypes "../types/applications";
import CommonTypes "../types/common";

module {
  public type UserId = CommonTypes.UserId;
  public type JobId = CommonTypes.JobId;
  public type ApplicationId = CommonTypes.ApplicationId;
  public type Application = AppTypes.Application;
  public type ApplicationPublic = AppTypes.ApplicationPublic;
  public type SubmitApplicationInput = AppTypes.SubmitApplicationInput;
  public type ApplicationStatus = CommonTypes.ApplicationStatus;

  public func toPublic(app : Application) : ApplicationPublic {
    {
      id = app.id;
      jobId = app.jobId;
      applicantId = app.applicantId;
      coverLetter = app.coverLetter;
      appliedAt = app.appliedAt;
      status = app.status;
    };
  };

  public func submitApplication(
    applications : Map.Map<ApplicationId, Application>,
    nextId : Nat,
    caller : UserId,
    input : SubmitApplicationInput,
  ) : Nat {
    // Prevent duplicate applications
    let alreadyApplied = applications.values().any(
      func(a : Application) : Bool {
        Principal.equal(a.applicantId, caller) and a.jobId == input.jobId
      }
    );
    if (alreadyApplied) {
      Runtime.trap("Already applied to this job");
    };
    let app : Application = {
      id = nextId;
      jobId = input.jobId;
      applicantId = caller;
      var coverLetter = input.coverLetter;
      appliedAt = Time.now();
      var status = #Pending;
    };
    applications.add(nextId, app);
    nextId;
  };

  public func withdrawApplication(
    applications : Map.Map<ApplicationId, Application>,
    caller : UserId,
    applicationId : ApplicationId,
  ) {
    switch (applications.get(applicationId)) {
      case (?app) {
        if (not Principal.equal(app.applicantId, caller)) {
          Runtime.trap("Not authorized: caller is not the applicant");
        };
        applications.remove(applicationId);
      };
      case null Runtime.trap("Application not found");
    };
  };

  public func updateApplicationStatus(
    applications : Map.Map<ApplicationId, Application>,
    employerJobs : [JobId],
    _caller : UserId,
    applicationId : ApplicationId,
    status : ApplicationStatus,
  ) {
    switch (applications.get(applicationId)) {
      case (?app) {
        // Verify the caller owns the job this application is for
        let ownsJob = employerJobs.any(func(jid : JobId) : Bool { jid == app.jobId });
        if (not ownsJob) {
          Runtime.trap("Not authorized: caller does not own this job");
        };
        app.status := status;
      };
      case null Runtime.trap("Application not found");
    };
  };

  public func listApplicationsForSeeker(
    applications : Map.Map<ApplicationId, Application>,
    seekerId : UserId,
  ) : [ApplicationPublic] {
    applications.values()
      .filter(func(a : Application) : Bool { Principal.equal(a.applicantId, seekerId) })
      .map(func(a : Application) : ApplicationPublic { toPublic(a) })
      .toArray();
  };

  public func listApplicationsForJob(
    applications : Map.Map<ApplicationId, Application>,
    jobId : JobId,
  ) : [ApplicationPublic] {
    applications.values()
      .filter(func(a : Application) : Bool { a.jobId == jobId })
      .map(func(a : Application) : ApplicationPublic { toPublic(a) })
      .toArray();
  };

  public func listApplicationsForEmployerJobs(
    applications : Map.Map<ApplicationId, Application>,
    jobIds : [JobId],
  ) : [ApplicationPublic] {
    applications.values()
      .filter(func(a : Application) : Bool {
        jobIds.any(func(jid : JobId) : Bool { jid == a.jobId })
      })
      .map(func(a : Application) : ApplicationPublic { toPublic(a) })
      .toArray();
  };

  public func hasApplied(
    applications : Map.Map<ApplicationId, Application>,
    seekerId : UserId,
    jobId : JobId,
  ) : Bool {
    applications.values().any(
      func(a : Application) : Bool {
        Principal.equal(a.applicantId, seekerId) and a.jobId == jobId
      }
    );
  };
};
