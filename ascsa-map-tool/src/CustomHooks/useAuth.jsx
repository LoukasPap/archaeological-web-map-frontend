import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyToken } from "../Queries";

const AuthContext = createContext(null);

const readToken = () => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

/**
 * Keeps the auth state of the app in one place. Guests are first-class:
 * `user` is null for them and nothing redirects. Anything that needs an
 * account calls `openAuthDialog(message)` instead.
 */
export function AuthProvider({ children }) {
  const qc = useQueryClient();
  const [token, setToken] = useState(readToken);
  const [dialog, setDialog] = useState({ open: false, message: "" });
  const [expired, setExpired] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verifyToken", token],
    queryFn: () => verifyToken(token),
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 45,
  });

  // An invalid/expired token just turns the user back into a guest
  useEffect(() => {
    if (token && isError) {
      localStorage.removeItem("token");
      setToken(null);
      setExpired(true);
    }
  }, [token, isError]);

  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setExpired(false);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    qc.removeQueries({ queryKey: ["verifyToken"] });
    qc.removeQueries({ queryKey: ["collectionData"] });
  }, [qc]);

  const openAuthDialog = useCallback((message = "") => {
    setDialog({ open: true, message });
  }, []);

  const closeAuthDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      isAuthenticated: !!data?.user,
      isLoading: !!token && isLoading,
      sessionExpired: expired,
      login,
      logout,
      authDialog: dialog,
      openAuthDialog,
      closeAuthDialog,
    }),
    [data, token, isLoading, expired, login, logout, dialog, openAuthDialog, closeAuthDialog]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
