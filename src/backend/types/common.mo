module {
  public type UserId = Principal;
  public type JobId = Nat;
  public type ApplicationId = Nat;
  public type Timestamp = Int;

  public type UserType = {
    #JobSeeker;
    #Employer;
  };

  public type JobType = {
    #FullTime;
    #PartTime;
    #Remote;
  };

  public type JobStatus = {
    #Open;
    #Closed;
  };

  public type ApplicationStatus = {
    #Pending;
    #Viewed;
    #Accepted;
    #Rejected;
  };
};
