"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession, ADMIN_ROLES } from "@/lib/session";
import { parseBulletinForm, type BulletinResult } from "@/lib/bulletin-rules";

function refreshBoards() {
  revalidatePath("/bulletins");
  revalidatePath("/kiosk/bulletins");
  revalidatePath("/admin/bulletin-board");
}

/** New Bulletin form, available to every signed-in user. */
export async function createBulletin(formData: FormData): Promise<BulletinResult> {
  const session = await requireSession();
  const parsed = parseBulletinForm(formData);
  if (!parsed.ok) return parsed;

  await prisma.bulletin.create({ data: { ...parsed.data, creatorId: session.user.id ?? null } });
  refreshBoards();
  return { ok: true };
}

/** Admin: edit any field of a bulletin. */
export async function updateBulletin(formData: FormData): Promise<BulletinResult> {
  await requireRole(ADMIN_ROLES);
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing bulletin id." };

  const parsed = parseBulletinForm(formData);
  if (!parsed.ok) return parsed;

  await prisma.bulletin.update({ where: { id }, data: parsed.data });
  refreshBoards();
  return { ok: true };
}

/** Admin: approve, reject or restore a bulletin. Records reviewer and review date. */
export async function reviewBulletin(formData: FormData): Promise<BulletinResult> {
  const session = await requireRole(ADMIN_ROLES);
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!id) return { ok: false, error: "Missing bulletin id." };

  const reviewer = (session.user.name ?? session.user.email ?? "Admin").slice(0, 50);
  const reviewed = { reviewer, dateReviewed: new Date() };

  if (decision === "approve") {
    await prisma.bulletin.update({ where: { id }, data: { approved: true, rejected: false, ...reviewed } });
  } else if (decision === "reject") {
    await prisma.bulletin.update({ where: { id }, data: { approved: false, rejected: true, ...reviewed } });
  } else if (decision === "restore") {
    await prisma.bulletin.update({ where: { id }, data: { approved: false, rejected: null, ...reviewed } });
  } else {
    return { ok: false, error: "Unknown review decision." };
  }

  refreshBoards();
  return { ok: true };
}

/** Admin: delete a bulletin. */
export async function deleteBulletin(formData: FormData): Promise<BulletinResult> {
  await requireRole(ADMIN_ROLES);
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing bulletin id." };

  await prisma.bulletin.delete({ where: { id } });
  refreshBoards();
  return { ok: true };
}
