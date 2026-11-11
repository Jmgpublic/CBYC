"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { SPACE_STATUSES } from "@/lib/constants";
import { getSpaceTypes } from "@/lib/space-types";

export async function createSpace(formData: FormData) {
  await requireRole(STAFF_ROLES);

  const siteId = String(formData.get("siteId") ?? "");
  const spaceType = String(formData.get("spaceType") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "VACANT");

  if (!siteId || !description) throw new Error("Site and description are required.");
  const activeTypes = await getSpaceTypes({ activeOnly: true });
  if (!activeTypes.some((t) => t.name === spaceType)) throw new Error("Invalid space type.");
  if (!(SPACE_STATUSES as readonly string[]).includes(status)) throw new Error("Invalid status.");

  await prisma.space.create({
    data: { siteId, spaceType, description, status: status as (typeof SPACE_STATUSES)[number] },
  });
  revalidatePath("/site-management/space-roster");
}
