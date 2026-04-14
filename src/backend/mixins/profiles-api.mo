import Map "mo:core/Map";
import Time "mo:core/Time";
import ProfileLib "../lib/profiles";
import ProfileTypes "../types/profiles";
import CommonTypes "../types/common";

mixin (
  jobSeekers : Map.Map<CommonTypes.UserId, ProfileTypes.JobSeekerProfile>,
  employers : Map.Map<CommonTypes.UserId, ProfileTypes.EmployerProfile>,
) {
  public shared ({ caller }) func setUserType(userType : CommonTypes.UserType) : async () {
    // Creating a minimal profile entry to record the user type
    switch (userType) {
      case (#JobSeeker) {
        if (not jobSeekers.containsKey(caller)) {
          let profile : ProfileTypes.JobSeekerProfile = {
            id = caller;
            var name = "";
            var email = "";
            var phone = "";
            var skills = "";
            var yearsOfExperience = 0;
            var bio = "";
            createdAt = Time.now();
          };
          jobSeekers.add(caller, profile);
        };
      };
      case (#Employer) {
        if (not employers.containsKey(caller)) {
          let profile : ProfileTypes.EmployerProfile = {
            id = caller;
            var companyName = "";
            var description = "";
            var websiteUrl = "";
            createdAt = Time.now();
          };
          employers.add(caller, profile);
        };
      };
    };
  };

  public shared ({ caller }) func upsertJobSeekerProfile(
    input : ProfileTypes.UpsertJobSeekerInput
  ) : async () {
    ProfileLib.upsertJobSeeker(jobSeekers, caller, input);
  };

  public shared ({ caller }) func upsertEmployerProfile(
    input : ProfileTypes.UpsertEmployerInput
  ) : async () {
    ProfileLib.upsertEmployer(employers, caller, input);
  };

  public shared query ({ caller }) func getMyJobSeekerProfile() : async ?ProfileTypes.JobSeekerProfilePublic {
    ProfileLib.getJobSeeker(jobSeekers, caller);
  };

  public shared query ({ caller }) func getMyEmployerProfile() : async ?ProfileTypes.EmployerProfilePublic {
    ProfileLib.getEmployer(employers, caller);
  };

  public query func getJobSeekerProfile(userId : CommonTypes.UserId) : async ?ProfileTypes.JobSeekerProfilePublic {
    ProfileLib.getJobSeeker(jobSeekers, userId);
  };

  public query func getEmployerProfile(userId : CommonTypes.UserId) : async ?ProfileTypes.EmployerProfilePublic {
    ProfileLib.getEmployer(employers, userId);
  };

  public shared query ({ caller }) func getMyUserType() : async ?CommonTypes.UserType {
    ProfileLib.getUserType(jobSeekers, employers, caller);
  };

  public query func getUserType(userId : CommonTypes.UserId) : async ?CommonTypes.UserType {
    ProfileLib.getUserType(jobSeekers, employers, userId);
  };
};
