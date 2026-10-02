"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart, naira } from "@/lib/cart";
export default function Checkout() {
  const { items, remove, total } = useCart();
  const [f, setF] = useState({ name: "", phone: "", address: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const pay = async () => {
    setErr(""); setBusy(true);
    const { data } = await supabase.auth.getSession();
    if (!data.session) { setErr("Sign in with Google first."); setBusy(false); return; }
    const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ ...f, items: items.map((i) => ({ id: i.id, qty: i.qty })) }) });
    const j = await r.json();
    if (j.url) location.href = j.url; else { setErr(j.error || "Payment could not start. Try again."); setBusy(false); }
  };
  const input = "w-full rounded-lg border border-sand bg-white px-3 py-2";
  if (!items.length) return <main className="mx-auto max-w-xl px-6 py-14"><h1 className="text-4xl">Your cart is empty</h1><p className="mt-2">Add a product from the shop to check out.</p></main>;
  return (
    <main className="mx-auto max-w-xl px-6 py-14">
      <h1 className="text-4xl">Checkout</h1>
      <ul className="mt-6 divide-y divide-sand">
        {items.map((i) => (<li key={i.id} className="flex justify-between py-3"><span>{i.name} × {i.qty}</span><span>{naira(i.price_kobo * i.qty)} <button className="ml-3 text-sm underline" onClick={() => remove(i.id)}>Remove</button></span></li>))}
      </ul>
      <p className="mt-4 text-right text-xl">Total {naira(total)}</p>
      <div className="mt-8 space-y-3">
        <input className={input} placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={input} placeholder="Phone number" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <textarea className={input} placeholder="Delivery address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
      </div>
      {err && <p role="alert" className="mt-3 text-red-700">{err}</p>}
      <button disabled={busy} onClick={pay} className="mt-6 w-full rounded-full bg-ink py-3 text-cream disabled:opacity-50">{busy ? "Starting payment…" : `Pay ${naira(total)} with Paystack`}</button>
    </main>
  );
}
