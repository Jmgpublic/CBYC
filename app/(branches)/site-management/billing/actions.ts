"use server";

import { revalidatePath } from "next/cache";
import { RevenueStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";

const BILLING_PATH = "/site-management/billing";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Moves selected FORECAST events to BILLED. HOLD events are skipped by design. */
export async function processCharges(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  if (ids.length === 0) return;

  const now = new Date();
  const due = new Date(now.getTime() + 30 * DAY_MS);

  await prisma.$transaction(
    ids.map((id) =>
      prisma.revenueEvent.updateMany({
        where: { id, status: RevenueStatus.FORECAST },
        data: { status: RevenueStatus.BILLED, dateBillCreate: now, dateDue: due },
      }),
    ),
  );
  revalidatePath(BILLING_PATH);
}

/** Row action: toggles an event between HOLD and FORECAST. */
export async function toggleHold(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  const event = await prisma.revenueEvent.findUnique({ where: { id } });
  if (!event || event.status === RevenueStatus.BILLED) return;

  await prisma.revenueEvent.update({
    where: { id },
    data: { status: event.status === RevenueStatus.HOLD ? RevenueStatus.FORECAST : RevenueStatus.HOLD },
  });
  revalidatePath(BILLING_PATH);
}

/** Row action: removes a revenue event that has not been billed. */
export async function deleteRevenueEvent(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  await prisma.revenueEvent.deleteMany({
    where: { id, status: { in: [RevenueStatus.FORECAST, RevenueStatus.HOLD] } },
  });
  revalidatePath(BILLING_PATH);
}

/** Row action (Edit modal): adjusts the proposed amount of an unbilled event. */
export async function updateChargeAmount(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Enter a valid amount.");

  await prisma.revenueEvent.updateMany({
    where: { id, status: { in: [RevenueStatus.FORECAST, RevenueStatus.HOLD] } },
    data: { amount },
  });
  revalidatePath(BILLING_PATH);
}
