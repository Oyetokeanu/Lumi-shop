import { NextResponse } from "next/server";
import { markPaid } from "@/lib/orders";
export async function GET(req: Request) {
  const ref = new URL(req.url).searchParams.get("reference");
  return NextResponse.json({ paid: ref ? await markPaid(ref) : false });
}
