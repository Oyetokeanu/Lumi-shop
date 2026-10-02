"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cart";
export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const { count } = useCart();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  const btn = "text-sm underline-offset-4 hover:underline";
  return (
    <header className="flex items-center justify-between px-6 py-5 border-b border-sand">
      <Link href="/" className="text-4xl tracking-wide">Lumi</Link>
      <nav className="flex items-center gap-6">
        {email ? <button className={btn} onClick={() => supabase.auth.signOut()}>Sign out ({email})</button>
          : <button className={btn} onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin } })}>Sign in with Google</button>}
        <Link href="/checkout" className="rounded-full bg-ink px-4 py-2 text-sm text-cream">Cart ({count})</Link>
      </nav>
    </header>
  );
}
