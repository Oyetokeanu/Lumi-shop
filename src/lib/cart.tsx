"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
export type Item = { id: string; name: string; price_kobo: number; qty: number };
type CartCtx = { items: Item[]; add: (p: Omit<Item, "qty">) => void; remove: (id: string) => void; clear: () => void; total: number; count: number };
const Ctx = createContext<CartCtx>(null as unknown as CartCtx);
export const useCart = () => useContext(Ctx);
export const naira = (k: number) => "₦" + (k / 100).toLocaleString("en-NG");

const readLocal = (): Item[] => { try { return JSON.parse(localStorage.getItem("lumi-cart") || "[]"); } catch { return []; } };
const writeLocal = (n: Item[]) => { try { localStorage.setItem("lumi-cart", JSON.stringify(n)); } catch {} };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const load = async (id: string) => {
    const { data } = await supabase.from("cart_items").select("product_id,name,price_kobo,qty").eq("user_id", id).order("name");
    setItems((data ?? []).map((r: any) => ({ id: r.product_id, name: r.name, price_kobo: r.price_kobo, qty: r.qty })));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUid(data.session?.user.id ?? null); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUid(s?.user.id ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!uid) { setItems(readLocal()); return; }
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const local = readLocal();
      if (local.length) {
        const { data: existing } = await supabase.from("cart_items").select("product_id,qty").eq("user_id", uid);
        const have = new Map((existing ?? []).map((r: any): [string, number] => [r.product_id, r.qty]));
        await supabase.from("cart_items").upsert(local.map((i) => ({ user_id: uid, product_id: i.id, name: i.name, price_kobo: i.price_kobo, qty: i.qty + (have.get(i.id) ?? 0) })));
        writeLocal([]);
      }
      await load(uid);
      channel = supabase.channel("cart-" + uid).on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${uid}` }, () => load(uid)).subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [uid, ready]);

  const add: CartCtx["add"] = async (p) => {
    const cur = items.find((i) => i.id === p.id);
    const qty = (cur?.qty ?? 0) + 1;
    const next = cur ? items.map((i) => (i.id === p.id ? { ...i, qty } : i)) : [...items, { ...p, qty }];
    setItems(next);
    if (uid) await supabase.from("cart_items").upsert({ user_id: uid, product_id: p.id, name: p.name, price_kobo: p.price_kobo, qty });
    else writeLocal(next);
  };
  const remove = async (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    if (uid) await supabase.from("cart_items").delete().eq("user_id", uid).eq("product_id", id);
    else writeLocal(next);
  };
  const clear = async () => {
    setItems([]);
    if (uid) await supabase.from("cart_items").delete().eq("user_id", uid);
    else writeLocal([]);
  };

  const total = items.reduce((s, i) => s + i.price_kobo * i.qty, 0);
  return <Ctx.Provider value={{ items, add, remove, clear, total, count: items.reduce((s, i) => s + i.qty, 0) }}>{children}</Ctx.Provider>;
}
