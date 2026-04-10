import { useMemo, useSyncExternalStore } from "react";
import { clearToken, getToken, setToken, subscribeToTokenChange } from "@/lib/storage";

export function useAuth() {
  const token = useSyncExternalStore(subscribeToTokenChange, getToken, () => null);

  return useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login: (nextToken: string) => setToken(nextToken),
      logout: () => clearToken(),
    }),
    [token],
  );
}
