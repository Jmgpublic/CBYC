"use server";

import { revalidatePath } from "next/cache";
import { CaseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";

const PATH = "/cases/records";

export async function createCase(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const residentId = String(formData.get("residentId") ?? "") || null;
  if (!title || !category) throw new Error("Title and category are required.");

  await prisma.case.create({ data: { title, description, category, residentId, status: "OPEN" } });
  revalidatePath(PATH);
}

/** Updates status, assignment and resolution. Resolution is stored when the case is resolved or closed. */
export async function updateCase(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!(Object.values(CaseStatus) as string[]).includes(status)) throw new Error("Invalid status.");

  await prisma.case.update({
    where: { id },
    data: {
      status: status as CaseStatus,
      assignedTo: String(formData.get("assignedTo") ?? "").trim() || null,
      resolution: String(formData.get("resolution") ?? "").trim() || null,
    },
  });
  revalidatePath(PATH);
}
