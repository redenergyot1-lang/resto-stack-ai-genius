import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await googleSignIn();
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 px-5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-6">
          <img src="/logo-mark.png" alt="" className="w-11 h-11 rounded-full object-cover ring-1 ring-ink-900/10" />
          <span className="font-display text-2xl font-bold text-gold-600">RestoStack</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink-900 text-center">Create your account</h1>
        <p className="text-sm text-ink-300 text-center mt-1.5 mb-7">Order from the city's finest restaurants</p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3.5 py-2.5 rounded-xl mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-gold-600 text-sm"
            />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-gold-600 text-sm"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password (min. 6 characters)"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-gold-600 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-ink-900/10" />
          <span className="text-xs text-ink-300">OR</span>
          <div className="flex-1 h-px bg-ink-900/10" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 border border-ink-900/15 hover:bg-cream-100 font-medium py-3 rounded-xl transition-colors text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.14A6.5 6.5 0 015.5 12c0-.74.13-1.46.34-2.14V7.02H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.98l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.02l3.66 2.84c.87-2.6 3.3-4.48 6.16-4.48z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-ink-300 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-gold-600 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
