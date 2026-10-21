/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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

  /**
   * refreshMe
   * - gọi /api/auth/me với credentials:'include'
   * - nếu 401 => user = null
   */
  const refreshMe = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await httpRequest("/api/auth/me");
      setUser(payload?.data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await httpRequest("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setUser(null);
    }
  }, []);

  // Lần mount đầu: tự gọi me để khôi phục session
  useEffect(() => {
    const initializeAuth = async () => {
      await refreshMe();
    };

    initializeAuth();
  }, [refreshMe]);

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
