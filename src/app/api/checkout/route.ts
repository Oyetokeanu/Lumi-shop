import { NextResponse } from "next/server";
import { admin } from "@/lib/orders";
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
export async function POST(req: Request) {
  const db = admin();
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const { data: u } = await db.auth.getUser(token);
  if (!u.user) return fail("Sign in with Google first.", 401);
  const { items, name, phone, address } = await req.json();
  if (!Array.isArray(items) || !items.length || !name?.trim() || !address?.trim()) return fail("Enter your name and delivery address.", 400);
  const { data: prods } = await db.from("products").select("id,name,price_kobo").in("id", items.map((i: any) => i.id));
  // Prices always come from the database, never from the browser.
  const lines = items.flatMap((i: any) => {
    const p = prods?.find((x) => x.id === i.id);
    return p ? [{ product_id: p.id, name: p.name, unit_kobo: p.price_kobo, qty: Math.min(Math.max(parseInt(i.qty) || 1, 1), 20) }] : [];
  });
  if (!lines.length) return fail("Those products are no longer available.", 400);
  const total = lines.reduce((s, l) => s + l.unit_kobo * l.qty, 0);
  const { data: order, error } = await db.from("orders").insert({ user_id: u.user.id, email: u.user.email, name, phone, address, total_kobo: total }).select().single();
  if (error || !order) return fail("Could not create your order.", 500);
  await db.from("order_items").insert(lines.map((l) => ({ ...l, order_id: order.id })));
  const j = await (await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email: order.email, amount: total, reference: order.id, callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success` }),
  })).json();
  return j.status ? NextResponse.json({ url: j.data.authorization_url }) : fail("Paystack could not start the payment.", 502);
}
