import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type Timestamp = CommonTypes.Timestamp;
  public type UserType = CommonTypes.UserType;

  public type JobSeekerProfile = {
    id : UserId;
    var name : Text;
    var email : Text;
    var phone : Text;
    var skills : Text;
    var yearsOfExperience : Nat;
    var bio : Text;
    createdAt : Timestamp;
  };

  public type EmployerProfile = {
    id : UserId;
    var companyName : Text;
    var description : Text;
    var websiteUrl : Text;
    createdAt : Timestamp;
  };

  public type JobSeekerProfilePublic = {
    id : UserId;
    name : Text;
    email : Text;
    phone : Text;
    skills : Text;
    yearsOfExperience : Nat;
    bio : Text;
    createdAt : Timestamp;
  };

  public type EmployerProfilePublic = {
    id : UserId;
    companyName : Text;
    description : Text;
    websiteUrl : Text;
    createdAt : Timestamp;
  };

  public type UpsertJobSeekerInput = {
    name : Text;
    email : Text;
    phone : Text;
    skills : Text;
    yearsOfExperience : Nat;
    bio : Text;
  };

  public type UpsertEmployerInput = {
    companyName : Text;
    description : Text;
    websiteUrl : Text;
  };
};
