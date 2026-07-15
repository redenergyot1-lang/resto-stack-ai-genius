import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// NOTE: This is a mock auth layer that mimics the shape of a real JWT flow
// so swapping in the Express + JWT backend later is a drop-in change:
//   login(email, password) -> POST /api/auth/login -> { token, user }
//   signup(payload)        -> POST /api/auth/signup -> { token, user }
//   googleSignIn()         -> Google OAuth -> POST /api/auth/google
const STORAGE_KEY = "restostack_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  function persist(user, token) {
    setUser(user);
    setToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
  }

  async function login(email, password) {
    // TODO: replace with axios.post('/api/auth/login', { email, password })
    await new Promise((r) => setTimeout(r, 500));
    if (!email || !password) throw new Error("Email and password are required.");
    const mockUser = {
      id: "U1",
      name: email.split("@")[0].replace(/[._]/g, " "),
      email,
      avatar: null,
    };
    persist(mockUser, "mock-jwt-token");
    return mockUser;
  }

  async function signup({ name, email, password }) {
    // TODO: replace with axios.post('/api/auth/signup', { name, email, password })
    await new Promise((r) => setTimeout(r, 500));
    if (!name || !email || !password) throw new Error("All fields are required.");
    const mockUser = { id: "U" + Date.now(), name, email, avatar: null };
    persist(mockUser, "mock-jwt-token");
    return mockUser;
  }

  async function googleSignIn() {
    // TODO: replace with real Google OAuth flow -> POST /api/auth/google
    await new Promise((r) => setTimeout(r, 500));
    const mockUser = { id: "U-google", name: "Aarav Sharma", email: "aarav.sharma@gmail.com", avatar: null };
    persist(mockUser, "mock-jwt-token-google");
    return mockUser;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function updateProfile(updates) {
    // TODO: replace with axios.patch('/api/auth/me', updates)
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: next, token }));
      return next;
    });
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, googleSignIn, logout, updateProfile, isAuthenticated: !!user }}
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
