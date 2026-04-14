import Map "mo:core/Map";
import ProfileTypes "types/profiles";
import JobTypes "types/jobs";
import AppTypes "types/applications";
import CommonTypes "types/common";
import ProfilesMixin "mixins/profiles-api";
import JobsMixin "mixins/jobs-api";
import ApplicationsMixin "mixins/applications-api";
import AdminMixin "mixins/admin-api";

actor {
  // --- State ---
  let jobSeekers = Map.empty<CommonTypes.UserId, ProfileTypes.JobSeekerProfile>();
  let employers = Map.empty<CommonTypes.UserId, ProfileTypes.EmployerProfile>();
  let jobs = Map.empty<CommonTypes.JobId, JobTypes.Job>();
  let applications = Map.empty<CommonTypes.ApplicationId, AppTypes.Application>();

  // --- Mixins ---
  include ProfilesMixin(jobSeekers, employers);
  include JobsMixin(jobs);
  include ApplicationsMixin(applications, jobs);
  include AdminMixin(jobSeekers, employers, jobs, applications);
};
