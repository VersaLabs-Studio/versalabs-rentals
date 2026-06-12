"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Fake auth — any credentials work. State persists in localStorage.
 * In a real app this becomes Supabase auth; the surface (useAuth) stays identical.
 */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager";
  loggedInAt: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SessionUser>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "rentflow:session";

const DEMO_USER: SessionUser = {
  id: "demo-user-001",
  name: "Kidus Abdula",
  email: "admin@rentflow.et",
  role: "admin",
  loggedInAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionUser;
        setUser(parsed);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  // Route guard: redirect to /login if not authenticated (except on /login)
  useEffect(() => {
    if (loading) return;
    const onLogin = pathname === "/login";
    if (!user && !onLogin) {
      router.replace("/login");
    } else if (user && onLogin) {
      router.replace("/dashboard");
    }
  }, [user, loading, pathname, router]);

  const signIn = async (email: string, _password: string): Promise<SessionUser> => {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 350));
    const sessionUser: SessionUser = {
      ...DEMO_USER,
      email: email || DEMO_USER.email,
      name: email
        ? email
            .split("@")[0]
            ?.replace(/[._-]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()) || DEMO_USER.name
        : DEMO_USER.name,
      loggedInAt: new Date().toISOString(),
    };
    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
