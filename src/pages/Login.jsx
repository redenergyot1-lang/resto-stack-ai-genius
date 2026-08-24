import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, googleSignIn, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);

  const next = params.get("next") || "/";

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setNeedsVerification(false);
    setLoading(true);
    try {
      await login(email, password);
      navigate(next);
    } catch (err) {
      if (err.code === "email_not_confirmed") {
        setNeedsVerification(true);
        setError("Please verify your email. A verification link has been sent to your email address.");
      } else if (err.code === "rate_limited") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (err.code === "invalid_credentials" || err.code === "unknown") {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending || !email) return;
    setResending(true);
    setNotice("");
    try {
      await resendVerification(email);
      setNotice("Verification email sent. Please check your inbox and spam folder.");
      setCooldown(45);
    } catch (err) {
      setError(err.message || "Could not send verification email. Please try again shortly.");
    } finally {
      setResending(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await googleSignIn();
      navigate(next);
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
        <h1 className="font-display text-2xl font-bold text-ink-900 text-center">Welcome back</h1>
        <p className="text-sm text-ink-300 text-center mt-1.5 mb-7">Sign in to order from your favourite restaurants</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3.5 py-2.5 rounded-xl mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
            {needsVerification && (
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="mt-2 ml-[23px] text-xs font-semibold text-gold-600 hover:text-gold-700 disabled:opacity-60 underline underline-offset-2"
              >
                {resending ? "Sending..." : cooldown > 0 ? `Resend verification email (${cooldown}s)` : "Resend verification email"}
              </button>
            )}
          </div>
        )}

        {notice && (
          <div className="flex items-start gap-2 bg-green-50 text-green-700 text-sm px-3.5 py-2.5 rounded-xl mb-4">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> {notice}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-gold-600 text-sm"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-ink-900/15 outline-none focus:border-gold-600 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
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
          New to RestoStack?{" "}
          <Link to="/signup" className="text-gold-600 font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
