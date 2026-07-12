"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { apiFetch, getToken, setToken } from "./api";

export type Role = "user" | "admin";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: "active" | "locked";
  avatar?: string;
}

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterInput) => Promise<{ email: string; devOtp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<AuthUser>;
  resendOtp: (email: string) => Promise<{ devOtp?: string }>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const PENDING_REGISTRATION_KEY = "xeviet_pending_registration";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await apiFetch<AuthUser>("/auth/me");
      setUser(me);
    } catch {
      // Token hết hạn / không hợp lệ — đăng xuất
      setToken(null);
      setUser(null);
    }
  }, []);

  // Khôi phục phiên đăng nhập khi tải lại trang (dựa vào JWT lưu trong localStorage)
  useEffect(() => {
    refreshMe().finally(() => setIsLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    return apiFetch<{ message: string; email: string; devOtp?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    return apiFetch<{ message: string; devOtp?: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, verifyOtp, resendOtp, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return ctx;
}
