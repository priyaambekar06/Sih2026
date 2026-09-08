import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("complygem_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("complygem_token");
    if (token && !user) {
      api.get<AuthUser>("/auth/me").then(setUser).catch(() => {
        localStorage.removeItem("complygem_token");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
      localStorage.setItem("complygem_token", res.token);
      localStorage.setItem("complygem_user", JSON.stringify(res.user));
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("complygem_token");
    localStorage.removeItem("complygem_user");
    setUser(null);
    window.location.href = "/login";
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
