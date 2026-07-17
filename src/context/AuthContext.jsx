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
    if (error) throw new Error(error.message);
    return toUser(data.session);
  }

  async function signup({ name, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { name } },
    });
    if (error) throw new Error(error.message);
    return toUser(data.session);
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message);
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
      value={{ user, session, token: session?.access_token || null, loading, login, signup, googleSignIn, logout, updateProfile, isAuthenticated: !!user }}
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
