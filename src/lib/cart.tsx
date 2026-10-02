"use client";
import { createContext, useContext, useEffect, useState } from "react";
export type Item = { id: string; name: string; price_kobo: number; qty: number };
type CartCtx = { items: Item[]; add: (p: Omit<Item, "qty">) => void; remove: (id: string) => void; clear: () => void; total: number; count: number };
const Ctx = createContext<CartCtx>(null as unknown as CartCtx);
export const useCart = () => useContext(Ctx);
export const naira = (k: number) => "₦" + (k / 100).toLocaleString("en-NG");
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("lumi-cart") || "[]")); } catch {} }, []);
  const save = (n: Item[]) => { setItems(n); try { localStorage.setItem("lumi-cart", JSON.stringify(n)); } catch {} };
  const add: CartCtx["add"] = (p) => save(items.some((i) => i.id === p.id) ? items.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)) : [...items, { ...p, qty: 1 }]);
  const remove = (id: string) => save(items.filter((i) => i.id !== id));
  const total = items.reduce((s, i) => s + i.price_kobo * i.qty, 0);
  return <Ctx.Provider value={{ items, add, remove, clear: () => save([]), total, count: items.reduce((s, i) => s + i.qty, 0) }}>{children}</Ctx.Provider>;
}
