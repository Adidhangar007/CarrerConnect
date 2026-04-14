import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type JobId = CommonTypes.JobId;
  public type Timestamp = CommonTypes.Timestamp;
  public type JobType = CommonTypes.JobType;
  public type JobStatus = CommonTypes.JobStatus;

  public type Job = {
    id : JobId;
    var title : Text;
    var description : Text;
    var requiredSkills : Text;
    var location : Text;
    var salaryMin : Nat;
    var salaryMax : Nat;
    var jobType : JobType;
    var status : JobStatus;
    employerId : UserId;
    postedAt : Timestamp;
  };

  public type JobPublic = {
    id : JobId;
    title : Text;
    description : Text;
    requiredSkills : Text;
    location : Text;
    salaryMin : Nat;
    salaryMax : Nat;
    jobType : JobType;
    status : JobStatus;
    employerId : UserId;
    postedAt : Timestamp;
  };

  public type CreateJobInput = {
    title : Text;
    description : Text;
    requiredSkills : Text;
    location : Text;
    salaryMin : Nat;
    salaryMax : Nat;
    jobType : JobType;
  };

  public type UpdateJobInput = {
    id : JobId;
    title : Text;
    description : Text;
    requiredSkills : Text;
    location : Text;
    salaryMin : Nat;
    salaryMax : Nat;
    jobType : JobType;
  };
};
