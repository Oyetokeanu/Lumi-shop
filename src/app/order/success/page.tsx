"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
export default function Success() {
  const { clear } = useCart();
  const [s, setS] = useState<"checking" | "paid" | "failed">("checking");
  useEffect(() => {
    const ref = new URLSearchParams(location.search).get("reference");
    if (!ref) { setS("failed"); return; }
    fetch(`/api/verify?reference=${ref}`).then((r) => r.json()).then((j) => { if (j.paid) { clear(); setS("paid"); } else setS("failed"); }).catch(() => setS("failed"));
  }, []); // eslint-disable-line
  return (
    <main className="mx-auto max-w-xl px-6 py-14">
      <h1 className="text-4xl">{s === "checking" ? "Confirming your payment…" : s === "paid" ? "Order confirmed" : "Payment not confirmed"}</h1>
      <p className="mt-3">{s === "paid" ? "A confirmation email is on its way." : s === "failed" ? "No charge was confirmed. Return to your cart to try again." : "This takes a few seconds."}</p>
    </main>
  );
}
