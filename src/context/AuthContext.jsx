import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  function toUser(session) {
    if (!session?.user) return null;
    const u = session.user;
    const meta = u.user_metadata || {};
    return {
      id: u.id,
      email: u.email,
      name: meta.name || meta.full_name || (u.email ? u.email.split("@")[0] : "User"),
      avatar: meta.avatar_url || null,
    };
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(toUser(s));
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(toUser(data.session));
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const code = error.code || "";
      const msg = (error.message || "").toLowerCase();
      const err = new Error(error.message);
      if (code === "email_not_confirmed" || msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        err.code = "email_not_confirmed";
      } else if (error.status === 429 || code === "over_request_rate_limit" || msg.includes("rate limit")) {
        err.code = "rate_limited";
      } else if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
        err.code = "invalid_credentials";
      } else {
        err.code = code || "unknown";
      }
      throw err;
    }
    return toUser(data.session);
  }

  async function resendVerification(email) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message);
  }


  async function signup({ name, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { name } },
    });
    if (error) {
      const msg = (error.message || "").toLowerCase();
      const err = new Error(error.message);
      if (error.code === "user_already_exists" || msg.includes("already registered")) {
        err.code = "user_already_exists";
      } else if (error.status === 429 || msg.includes("rate limit")) {
        err.code = "rate_limited";
      } else {
        err.code = error.code || "unknown";
      }
      throw err;
    }
    // Supabase returns a user with an empty identities array when the email
    // already exists (to avoid leaking accounts). Treat that as "already registered".
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      const err = new Error("An account with this email already exists.");
      err.code = "user_already_exists";
      throw err;
    }
    return { user: toUser(data.session), needsVerification: !data.session };
  }

  async function googleSignIn(next = "/") {
    // Remember where the user wanted to go; /auth/callback reads this once the
    // session is hydrated. Only same-origin relative paths are kept.
    const safeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    try {
      sessionStorage.setItem("auth:next", safeNext);
    } catch {
      /* ignore private-mode storage errors */
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      const msg = (error.message || "").toLowerCase();
      const err = new Error(error.message);
      if (msg.includes("provider is not enabled") || msg.includes("unsupported provider")) {
        err.code = "provider_disabled";
      } else {
        err.code = error.code || "unknown";
      }
      throw err;
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser({
      email: updates.email,
      data: { name: updates.name, avatar_url: updates.avatar },
    });
    if (error) throw new Error(error.message);
    // Also sync profiles table if present
    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name: updates.name,
        avatar_url: updates.avatar,
      });
      setUser((prev) => ({ ...prev, ...updates }));
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, token: session?.access_token || null, loading, login, signup, googleSignIn, logout, updateProfile, resendVerification, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
