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
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    db.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = db.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const openFromLogin = () => openReset();
    window.addEventListener("english-open-forgot-password", openFromLogin);
    return () => window.removeEventListener("english-open-forgot-password", openFromLogin);
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    setEmail(session.user.email || "");
    void (async () => {
      const [{ data: profileData }, { data: ownedGroups }] = await Promise.all([
        db.from("english_profiles").select("full_name,username,role").eq("id", session.user.id).maybeSingle(),
        db.from("english_groups").select("id").eq("teacher_id", session.user.id).limit(1),
      ]);
      let next = profileData as Profile | null;
      if (ownedGroups?.length && next?.role !== "teacher") {
        const { data: repaired } = await db
          .from("english_profiles")
          .update({ role: "teacher" })
          .eq("id", session.user.id)
          .select("full_name,username,role")
          .maybeSingle();
        next = (repaired as Profile | null) || { ...(next || {}), role: "teacher" };
        window.location.reload();
        return;
      }
      setProfile(next);
    })();
  }, [session]);

  function openReset() {
    setStep("email"); setCode(""); setPassword(""); setError(""); setMessage(""); setForgotOpen(true);
  }

  async function sendCode(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    const { error: problem } = await db.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    });
    if (problem) setError(problem.message);
    else { setStep("code"); setMessage("Confirmation code sent. Check your email."); }
    setBusy(false);
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    const { error: problem } = await db.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (problem) setError(problem.message);
    else { setStep("password"); setMessage("Code confirmed. Choose a new password."); }
    setBusy(false);
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    const { error: problem } = await db.auth.updateUser({ password });
    if (problem) setError(problem.message);
    else { setMessage("Password changed successfully."); setPassword(""); }
    setBusy(false);
  }

  const initial = (profile?.full_name || profile?.username || session?.user.email || "U").trim()[0]?.toUpperCase() || "U";
  return <>
    {session ? (
      <button className="account-fab" onClick={() => setProfileOpen(true)} aria-label="Open my profile">
        <span>{initial}</span><UserRound /><b>Profile</b>
      </button>
    ) : (
      <button className="forgot-fab" onClick={openReset}><KeyRound /> Forgot password?</button>
    )}

    {profileOpen && session && <div className="account-shade">
      <section className="account-card">
        <button className="account-close" onClick={() => setProfileOpen(false)}><X /></button>
        <div className="account-avatar">{initial}</div>
        <h2>{profile?.full_name || "English learner"}</h2>
        <p>@{profile?.username || "learner"}</p>
        <span className="account-role">{profile?.role || "student"}</span>
        <dl><div><dt>Email</dt><dd>{session.user.email}</dd></div><div><dt>Account</dt><dd>Email verified</dd></div></dl>
        <button className="account-reset" onClick={() => { setProfileOpen(false); openReset(); }}><KeyRound /> Change password</button>
        <button className="account-signout" onClick={() => db.auth.signOut()}><LogOut /> Sign out</button>
      </section>
    </div>}

    {forgotOpen && <div className="account-shade">
      <section className="account-card reset-card">
        <button className="account-close" onClick={() => setForgotOpen(false)}><X /></button>
        <KeyRound className="reset-icon" />
        <h2>{step === "email" ? "Reset your password" : step === "code" ? "Enter confirmation code" : "Choose a new password"}</h2>
        {step === "email" && <><p>Enter your account email. We’ll send a one-time confirmation code instead of a reset link.</p><form onSubmit={sendCode}><label>Email address<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>{error && <div className="account-error">{error}</div>}<button disabled={busy}>{busy ? "Sending…" : "Send confirmation code"}</button></form></>}
        {step === "code" && <><p>Enter the confirmation code sent to <b>{email}</b>.</p><form onSubmit={verifyCode}><label>Confirmation code<input required inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Enter code" /></label>{error && <div className="account-error">{error}</div>}{message && <div className="account-success">{message}</div>}<button disabled={busy}>{busy ? "Checking…" : "Confirm code"}</button></form><button className="account-reset" onClick={() => setStep("email")}>Send another code</button></>}
        {step === "password" && <><p>Your email is confirmed. Create a new password for this account.</p><form onSubmit={savePassword}><label>New password<input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" /></label>{error && <div className="account-error">{error}</div>}{message && <div className="account-success">{message}</div>}<button disabled={busy}>{busy ? "Saving…" : "Save new password"}</button></form></>}
      </section>
    </div>}
  </>;
}
