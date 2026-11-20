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
import { AUTH_UNAUTHORIZED_EVENT, httpRequest } from "@/services/api/httpClient";

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
  const refreshController = useRef(null);

  const clearSession = useCallback(() => {
    refreshController.current?.abort();
    refreshController.current = null;
    setUser(null);
    setLoading(false);
  }, []);

  /**
   * refreshMe
   * - gọi /api/auth/me với credentials:'include'
   * - nếu 401 => user = null
   */
  const refreshMe = useCallback(async () => {
    refreshController.current?.abort();
    const controller = new AbortController();
    refreshController.current = controller;
    setLoading(true);

    try {
      const payload = await httpRequest("/api/auth/me", { signal: controller.signal });
      if (!controller.signal.aborted) setUser(payload?.data?.user ?? null);
    } catch {
      if (!controller.signal.aborted) setUser(null);
    } finally {
      if (!controller.signal.aborted) {
        refreshController.current = null;
        setLoading(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await httpRequest("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // Lần mount đầu: tự gọi me để khôi phục session
  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession);

    const initializeAuth = async () => {
      await refreshMe();
    };

    initializeAuth();
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, clearSession);
      refreshController.current?.abort();
    };
  }, [clearSession, refreshMe]);

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
