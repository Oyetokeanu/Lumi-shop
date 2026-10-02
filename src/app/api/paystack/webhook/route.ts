import crypto from "crypto";
import { NextResponse } from "next/server";
import { markPaid } from "@/lib/orders";
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(raw).digest("hex");
  if (sig !== req.headers.get("x-paystack-signature")) return new NextResponse("Bad signature", { status: 401 });
  const evt = JSON.parse(raw);
  if (evt.event === "charge.success") await markPaid(evt.data.reference);
  return NextResponse.json({ ok: true });
}
