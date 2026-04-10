import { useMemo } from "react";
import { clearToken, getToken, setToken } from "@/lib/storage";

export function useAuth() {
  const token = getToken();

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
