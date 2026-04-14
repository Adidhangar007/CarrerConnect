import Map "mo:core/Map";
import Time "mo:core/Time";
import ProfileTypes "../types/profiles";
import CommonTypes "../types/common";

module {
  public type UserId = CommonTypes.UserId;
  public type UserType = CommonTypes.UserType;
  public type JobSeekerProfile = ProfileTypes.JobSeekerProfile;
  public type EmployerProfile = ProfileTypes.EmployerProfile;
  public type JobSeekerProfilePublic = ProfileTypes.JobSeekerProfilePublic;
  public type EmployerProfilePublic = ProfileTypes.EmployerProfilePublic;
  public type UpsertJobSeekerInput = ProfileTypes.UpsertJobSeekerInput;
  public type UpsertEmployerInput = ProfileTypes.UpsertEmployerInput;

  public func toJobSeekerPublic(p : JobSeekerProfile) : JobSeekerProfilePublic {
    {
      id = p.id;
      name = p.name;
      email = p.email;
      phone = p.phone;
      skills = p.skills;
      yearsOfExperience = p.yearsOfExperience;
      bio = p.bio;
      createdAt = p.createdAt;
    };
  };

  public func toEmployerPublic(p : EmployerProfile) : EmployerProfilePublic {
    {
      id = p.id;
      companyName = p.companyName;
      description = p.description;
      websiteUrl = p.websiteUrl;
      createdAt = p.createdAt;
    };
  };

  public func upsertJobSeeker(
    jobSeekers : Map.Map<UserId, JobSeekerProfile>,
    caller : UserId,
    input : UpsertJobSeekerInput,
  ) {
    switch (jobSeekers.get(caller)) {
      case (?existing) {
        existing.name := input.name;
        existing.email := input.email;
        existing.phone := input.phone;
        existing.skills := input.skills;
        existing.yearsOfExperience := input.yearsOfExperience;
        existing.bio := input.bio;
      };
      case null {
        let profile : JobSeekerProfile = {
          id = caller;
          var name = input.name;
          var email = input.email;
          var phone = input.phone;
          var skills = input.skills;
          var yearsOfExperience = input.yearsOfExperience;
          var bio = input.bio;
          createdAt = Time.now();
        };
        jobSeekers.add(caller, profile);
      };
    };
  };

  public func upsertEmployer(
    employers : Map.Map<UserId, EmployerProfile>,
    caller : UserId,
    input : UpsertEmployerInput,
  ) {
    switch (employers.get(caller)) {
      case (?existing) {
        existing.companyName := input.companyName;
        existing.description := input.description;
        existing.websiteUrl := input.websiteUrl;
      };
      case null {
        let profile : EmployerProfile = {
          id = caller;
          var companyName = input.companyName;
          var description = input.description;
          var websiteUrl = input.websiteUrl;
          createdAt = Time.now();
        };
        employers.add(caller, profile);
      };
    };
  };

  public func getJobSeeker(
    jobSeekers : Map.Map<UserId, JobSeekerProfile>,
    userId : UserId,
  ) : ?JobSeekerProfilePublic {
    switch (jobSeekers.get(userId)) {
      case (?p) ?toJobSeekerPublic(p);
      case null null;
    };
  };

  public func getEmployer(
    employers : Map.Map<UserId, EmployerProfile>,
    userId : UserId,
  ) : ?EmployerProfilePublic {
    switch (employers.get(userId)) {
      case (?p) ?toEmployerPublic(p);
      case null null;
    };
  };

  public func listJobSeekers(
    jobSeekers : Map.Map<UserId, JobSeekerProfile>
  ) : [JobSeekerProfilePublic] {
    jobSeekers.values().map(func(p : JobSeekerProfile) : JobSeekerProfilePublic { toJobSeekerPublic(p) }).toArray();
  };

  public func listEmployers(
    employers : Map.Map<UserId, EmployerProfile>
  ) : [EmployerProfilePublic] {
    employers.values().map(func(p : EmployerProfile) : EmployerProfilePublic { toEmployerPublic(p) }).toArray();
  };

  public func getUserType(
    jobSeekers : Map.Map<UserId, JobSeekerProfile>,
    employers : Map.Map<UserId, EmployerProfile>,
    userId : UserId,
  ) : ?UserType {
    if (jobSeekers.containsKey(userId)) {
      ?#JobSeeker;
    } else if (employers.containsKey(userId)) {
      ?#Employer;
    } else {
      null;
    };
  };
};
