"use client";
import { FormEvent, useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { KeyRound, LogOut, UserRound, X } from "lucide-react";

const db = createClient(
  "https://kxuszpixwfecawdeqkrx.supabase.co",
  "sb_publishable__auyhjNpepXiYdGV5HEJ_A_AGsPbBuS",
);

type Profile = { full_name?: string; username?: string; role?: string };

export default function AccountTools() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    db.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = db.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    setEmail(session.user.email || "");
    db.from("english_profiles").select("full_name,username,role").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [session]);

  async function resetPassword(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const { error: problem } = await db.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (problem) setError(problem.message);
    else setMessage("Password reset email sent. Check your inbox and spam folder.");
    setBusy(false);
  }

  const initial = (profile?.full_name || profile?.username || session?.user.email || "U").trim()[0]?.toUpperCase() || "U";
  return <>
    {session ? (
      <button className="account-fab" onClick={() => setProfileOpen(true)} aria-label="Open my profile">
        <span>{initial}</span><UserRound /><b>Profile</b>
      </button>
    ) : (
      <button className="forgot-fab" onClick={() => setForgotOpen(true)}><KeyRound /> Forgot password?</button>
    )}

    {profileOpen && session && <div className="account-shade">
      <section className="account-card">
        <button className="account-close" onClick={() => setProfileOpen(false)}><X /></button>
        <div className="account-avatar">{initial}</div>
        <h2>{profile?.full_name || "English learner"}</h2>
        <p>@{profile?.username || "learner"}</p>
        <span className="account-role">{profile?.role || "student"}</span>
        <dl><div><dt>Email</dt><dd>{session.user.email}</dd></div><div><dt>Account</dt><dd>Email verified</dd></div></dl>
        <button className="account-reset" onClick={() => { setProfileOpen(false); setForgotOpen(true); }}><KeyRound /> Change password</button>
        <button className="account-signout" onClick={() => db.auth.signOut()}><LogOut /> Sign out</button>
      </section>
    </div>}

    {forgotOpen && <div className="account-shade">
      <section className="account-card reset-card">
        <button className="account-close" onClick={() => setForgotOpen(false)}><X /></button>
        <KeyRound className="reset-icon" />
        <h2>{session ? "Change your password" : "Forgot your password?"}</h2>
        <p>Enter your account email. We’ll send you a secure password-reset link.</p>
        <form onSubmit={resetPassword}>
          <label>Email address<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          {error && <div className="account-error">{error}</div>}
          {message && <div className="account-success">{message}</div>}
          <button disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
        </form>
      </section>
    </div>}
  </>;
}
