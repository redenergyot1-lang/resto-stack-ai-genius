import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { supabase } from "../integrations/supabase/client";

/**
 * OAuth / email-link landing route.
 * Supabase redirects here after Google sign-in (or an email confirmation link).
 * We wait for the session to be hydrated, then send the user to their
 * intended destination.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    function safeNext() {
      const stored = sessionStorage.getItem("auth:next") || "/";
      sessionStorage.removeItem("auth:next");
      // only allow same-origin relative paths
      return stored.startsWith("/") && !stored.startsWith("//") ? stored : "/";
    }

    // Provider errors come back in the query string or the hash fragment.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const providerError =
      query.get("error_description") || query.get("error") || hash.get("error_description") || hash.get("error");
    if (providerError) {
      setError(providerError);
      return;
    }

    async function finish() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        navigate(safeNext(), { replace: true });
        return;
      }
      // Session may still be exchanging — listen briefly.
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session && !cancelled) {
          sub.subscription.unsubscribe();
          navigate(safeNext(), { replace: true });
        }
      });
      setTimeout(() => {
        if (cancelled) return;
        sub.subscription.unsubscribe();
        supabase.auth.getSession().then(({ data: d }) => {
          if (cancelled) return;
          if (d.session) navigate(safeNext(), { replace: true });
          else setError("We couldn't complete the sign-in. Please try again.");
        });
      }, 4000);
    }

    finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 px-5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 text-center">
        {error ? (
          <>
            <div className="flex items-start gap-2 bg-red-50 text-red-600 text-sm px-3.5 py-2.5 rounded-xl text-left">
              <AlertCircle size={15} className="mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="mt-5 w-full bg-gold-600 hover:bg-gold-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto w-8 h-8 rounded-full border-2 border-gold-600 border-t-transparent animate-spin" />
            <p className="text-sm text-ink-300 mt-4">Signing you in…</p>
          </>
        )}
      </div>
    </div>
  );
}
