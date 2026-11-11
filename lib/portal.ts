import { redirect } from "next/navigation";
import { RevenueStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireResidentId } from "@/lib/session";

/**
 * Resident-scoped data access. Every function takes a residentId that must come
 * from the authenticated session (never from the request body or URL), and every
 * query filters on it. This is the row-level isolation boundary for the portal.
 */

/** Page guard: returns the signed-in resident's id and site, or redirects to the portal login. */
export async function currentResident() {
  const residentId = await requireResidentId();
  if (!residentId) redirect("/portal/login");
  const resident = await prisma.resident.findUnique({
    where: { id: residentId },
    select: { id: true, firstName: true, lastName: true, unit: true, siteId: true },
  });
  if (!resident) redirect("/portal/login");
  return resident;
}

export async function getAnnouncementsForSite(siteId: string) {
  return prisma.announcement.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });
}

export async function getMessages(residentId: string) {
  return prisma.message.findMany({
    where: { residentId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { name: true, role: true } } },
  });
}

export async function getServiceRequests(residentId: string) {
  return prisma.serviceRequest.findMany({
    where: { residentId },
    orderBy: { createdAt: "desc" },
    include: { workOrder: { select: { title: true, status: true } } },
  });
}

/** Balance = billed charges minus recorded payments. Forecast and held items are not yet owed. */
export async function getBalance(residentId: string) {
  const [billed, payments] = await Promise.all([
    prisma.revenueEvent.findMany({
      where: { residentId, status: RevenueStatus.BILLED },
      orderBy: { dateBillCreate: "desc" },
    }),
    prisma.payment.findMany({ where: { residentId }, orderBy: { createdAt: "desc" } }),
  ]);

  const charges = billed.reduce((s, e) => s + Number(e.amount), 0);
  const paid = payments.reduce((s, p) => s + Number(p.amount), 0);

  // Lease fee breakdown: billed amounts grouped by description.
  const breakdown = new Map<string, number>();
  for (const e of billed) breakdown.set(e.description, (breakdown.get(e.description) ?? 0) + Number(e.amount));

  const transactions = [
    ...billed.map((e) => ({
      id: `c-${e.id}`,
      date: e.dateBillCreate ?? e.dateProposed,
      label: `Charge: ${e.description}`,
      amount: -Number(e.amount),
    })),
    ...payments.map((p) => ({ id: `p-${p.id}`, date: p.createdAt, label: `Payment (${p.method})`, amount: Number(p.amount) })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    balance: charges - paid,
    charges,
    paid,
    breakdown: [...breakdown.entries()].map(([label, amount]) => ({ label, amount })),
    transactions,
    nextDue: billed.map((e) => e.dateDue).filter((d): d is Date => !!d).sort((a, b) => a.getTime() - b.getTime())[0] ?? null,
  };
}

/** Outstanding amount that a payment may apply to (never negative). */
export async function getAmountDue(residentId: string) {
  const b = await getBalance(residentId);
  return Math.max(0, Math.round(b.balance * 100) / 100);
}
