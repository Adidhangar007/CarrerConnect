import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import { UserType } from "../backend";
import { useAuth } from "./useAuth";

export function useUserType() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated, isAdmin } = useAuth();

  const { data: userType, isLoading } = useQuery<UserType | null>({
    queryKey: ["userType"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyUserType();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 30_000,
  });

  const isJobSeeker = userType === UserType.JobSeeker;
  const isEmployer = userType === UserType.Employer;

  return {
    userType: userType ?? null,
    isJobSeeker,
    isEmployer,
    isAdmin,
    isLoading,
  };
}
