import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { ADMIN_PRINCIPAL } from "../config";

export function useAuth() {
  const {
    identity,
    isAuthenticated,
    isInitializing,
    login,
    clear,
    loginStatus,
  } = useInternetIdentity();

  const principalText = identity?.getPrincipal().toText() ?? null;
  const isAdmin = principalText === ADMIN_PRINCIPAL;

  return {
    identity,
    isAuthenticated,
    isInitializing,
    isAdmin,
    principalText,
    login,
    logout: clear,
    loginStatus,
  };
}
