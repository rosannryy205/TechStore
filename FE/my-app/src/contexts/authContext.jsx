/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { httpRequest } from "@/services/api/httpClient";

/**
 * AuthContext
 * - isAuthenticated: true/false
 * - user: object from GET /api/auth/me
 * - refreshMe(): gọi /api/auth/me để cập nhật session
 * - logout(): gọi /api/auth/logout để xoá cookie
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileRequest = useRef(null);

  const clearSession = useCallback(() => {
    // Phản hồi /me đang chờ không được khôi phục phiên vừa kết thúc.
    profileRequest.current?.abort();
    setUser(null);
    setLoading(false);
  }, []);

  const loadSession = useCallback(() => {
    profileRequest.current?.abort();
    const controller = new AbortController();
    profileRequest.current = controller;
    return httpRequest("/api/auth/me", { signal: controller.signal })
      .then(
        (payload) => {
          if (!controller.signal.aborted) setUser(payload?.data?.user ?? null);
        },
        () => {
          if (!controller.signal.aborted) setUser(null);
        },
      )
      .finally(() => {
        if (profileRequest.current === controller) {
          profileRequest.current = null;
          if (!controller.signal.aborted) setLoading(false);
        }
      });
  }, []);

  const refreshMe = useCallback(() => {
    setLoading(true);
    return loadSession();
  }, [loadSession]);

  const logout = useCallback(async () => {
    try {
      await httpRequest("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    window.addEventListener("auth:unauthorized", clearSession);
    loadSession();
    return () => {
      window.removeEventListener("auth:unauthorized", clearSession);
      profileRequest.current?.abort();
    };
  }, [clearSession, loadSession]);

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: !!user,
      loading,
      refreshMe,
      logout,
    };
  }, [user, loading, refreshMe, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
