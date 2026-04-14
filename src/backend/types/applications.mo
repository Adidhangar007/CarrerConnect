import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type JobId = CommonTypes.JobId;
  public type ApplicationId = CommonTypes.ApplicationId;
  public type Timestamp = CommonTypes.Timestamp;
  public type ApplicationStatus = CommonTypes.ApplicationStatus;

  public type Application = {
    id : ApplicationId;
    jobId : JobId;
    applicantId : UserId;
    var coverLetter : Text;
    appliedAt : Timestamp;
    var status : ApplicationStatus;
  };

  public type ApplicationPublic = {
    id : ApplicationId;
    jobId : JobId;
    applicantId : UserId;
    coverLetter : Text;
    appliedAt : Timestamp;
    status : ApplicationStatus;
  };

  public type SubmitApplicationInput = {
    jobId : JobId;
    coverLetter : Text;
  };
};
