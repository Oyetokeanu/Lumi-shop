"use client";
import { useCart } from "@/lib/cart";
export default function AddToCart(p: { id: string; name: string; price_kobo: number }) {
  const { add } = useCart();
  return <button onClick={() => add(p)} className="rounded-full border border-gold px-4 py-2 text-sm hover:bg-gold hover:text-cream">Add to cart</button>;
}
