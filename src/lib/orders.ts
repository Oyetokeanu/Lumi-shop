import { createClient } from "@supabase/supabase-js";
const SK = () => process.env.PAYSTACK_SECRET_KEY!;
export const admin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

export async function markPaid(ref: string): Promise<boolean> {
  const db = admin();
  const j = await (await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, { headers: { Authorization: `Bearer ${SK()}` } })).json();
  const { data: order } = await db.from("orders").select("*, order_items(*)").eq("id", ref).single();
  if (!order || !j.status || j.data.status !== "success" || j.data.amount !== order.total_kobo) return false;
  const { data: updated } = await db.from("orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", ref).eq("status", "pending").select();
  if (updated?.length) await sendConfirmation(order);
  return true;
}

async function sendConfirmation(o: any) {
  try {
    const D = process.env.MAILGUN_DOMAIN!;
    const rows = o.order_items.map((i: any) => `<li>${i.name} × ${i.qty}: ₦${((i.unit_kobo * i.qty) / 100).toLocaleString("en-NG")}</li>`).join("");
    const html = `<h2>Thanks for your order, ${o.name}</h2><ul>${rows}</ul><p><b>Total: ₦${(o.total_kobo / 100).toLocaleString("en-NG")}</b></p><p>Delivering to: ${o.address}</p><p>Order ref: ${o.id}</p>`;
    await fetch(`${process.env.MAILGUN_BASE_URL || "https://api.mailgun.net"}/v3/${D}/messages`, {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from("api:" + process.env.MAILGUN_API_KEY).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ from: `Lumi <orders@${D}>`, to: o.email, subject: "Your Lumi order is confirmed", html }),
    });
  } catch (e) { console.error("Mailgun failed", e); }
}
