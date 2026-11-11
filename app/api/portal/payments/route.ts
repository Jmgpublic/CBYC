import { NextResponse } from "next/server";
import { requireResidentId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAmountDue } from "@/lib/portal";

export const dynamic = "force-dynamic";

/**
 * POST /api/portal/payments
 * DEVELOPMENT STUB: no payment processor is connected. This records a Payment row
 * against the signed-in resident's balance so the flow can be exercised end to end.
 * Replace the body with a real processor integration before go-live.
 */
export async function POST(req: Request) {
  const residentId = await requireResidentId();
  if (!residentId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { amount?: unknown } | null;
  const amount = Math.round(Number(body?.amount) * 100) / 100;

  const due = await getAmountDue(residentId);
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Enter an amount greater than zero." }, { status: 400 });
  if (amount > due) return NextResponse.json({ error: "Amount exceeds the current balance." }, { status: 400 });

  const payment = await prisma.payment.create({
    data: {
      residentId,
      amount,
      method: "Dev stub (no processor)",
      reference: `DEV-${Date.now().toString(36).toUpperCase()}`,
    },
  });
  return NextResponse.json({ reference: payment.reference, amount: Number(payment.amount) }, { status: 201 });
}
