"use client";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setMessage("Memproses…");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      location.href = "/";
    } catch (err) { setMessage(err instanceof Error ? err.message : "Login gagal"); }
  }
  return <main className="auth-shell">
    <section className="auth-card">
      <div className="brand-lockup"><span className="brand-mark">◆</span><div><strong>ProfitLab</strong><small>Know your real profit</small></div></div>
      <h1>Masuk ke ProfitLab</h1><p>Kelola profit, harga aman, dan campaign dari satu workspace.</p>
      <form onSubmit={submit} className="form-stack">
        <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></label>
        <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" required /></label>
        <button className="button primary" type="submit">Masuk</button>
      </form>
      {message && <div className="inline-note">{message}</div>}
    </section>
  </main>;
}
