"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";

const PATH = "/site-management/admin/space-types";
const DASHBOARD_PATH = "/site-management";

const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

function parseName(v: FormDataEntryValue | null): string {
  const name = String(v ?? "").trim();
  if (!name) throw new Error("Space type name is required.");
  if (name.length > 60) throw new Error("Space type name must be 60 characters or fewer.");
  return name;
}

function parseSortOrder(v: FormDataEntryValue | null): number {
  const n = Number(v ?? 0);
  if (!Number.isInteger(n) || n < 0 || n > 9999) throw new Error("Sort order must be a whole number from 0 to 9999.");
  return n;
}

/** Create a new space type. Names are unique, so a duplicate is rejected with a clear message. */
export async function createSpaceType(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const name = parseName(formData.get("name"));
  const existing = await prisma.spaceType.findUnique({ where: { name } });
  if (existing) throw new Error(`"${name}" already exists.`);

  await prisma.spaceType.create({
    data: {
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      sortOrder: parseSortOrder(formData.get("sortOrder")),
      isActive: bool(formData, "isActive"),
    },
  });
  revalidatePath(PATH);
  revalidatePath(DASHBOARD_PATH);
}

/**
 * Update a space type. Renaming cascades to Space and RevenueEvent rows that store the
 * old name, so existing records stay linked to the type.
 */
export async function updateSpaceType(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  const current = await prisma.spaceType.findUniqueOrThrow({ where: { id } });
  const name = parseName(formData.get("name"));

  if (name !== current.name) {
    const clash = await prisma.spaceType.findUnique({ where: { name } });
    if (clash) throw new Error(`"${name}" already exists.`);
  }

  await prisma.$transaction([
    prisma.spaceType.update({
      where: { id },
      data: {
        name,
        description: String(formData.get("description") ?? "").trim() || null,
        sortOrder: parseSortOrder(formData.get("sortOrder")),
        isActive: bool(formData, "isActive"),
      },
    }),
    ...(name !== current.name
      ? [
          prisma.space.updateMany({ where: { spaceType: current.name }, data: { spaceType: name } }),
          prisma.revenueEvent.updateMany({ where: { spaceType: current.name }, data: { spaceType: name } }),
        ]
      : []),
  ]);
  revalidatePath(PATH);
  revalidatePath(DASHBOARD_PATH);
}

/**
 * Delete a space type only when no space or charge uses it. Otherwise the type should be
 * deactivated instead, so historical records keep a valid type.
 */
export async function deleteSpaceType(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  const type = await prisma.spaceType.findUniqueOrThrow({ where: { id } });

  const [spaceCount, chargeCount] = await Promise.all([
    prisma.space.count({ where: { spaceType: type.name } }),
    prisma.revenueEvent.count({ where: { spaceType: type.name } }),
  ]);
  if (spaceCount > 0 || chargeCount > 0) {
    throw new Error(`"${type.name}" is in use by ${spaceCount} space(s) and ${chargeCount} charge(s). Deactivate it instead.`);
  }

  await prisma.spaceType.delete({ where: { id } });
  revalidatePath(PATH);
  revalidatePath(DASHBOARD_PATH);
}
