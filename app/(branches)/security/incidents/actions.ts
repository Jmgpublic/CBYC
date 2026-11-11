"use server";

import { revalidatePath } from "next/cache";
import { IncidentSeverity, IncidentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";

const PATH = "/security/incidents";

export async function createIncident(formData: FormData) {
  const session = await requireRole(STAFF_ROLES);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const siteId = String(formData.get("siteId") ?? "");
  const severity = String(formData.get("severity") ?? "");
  if (!title || !siteId) throw new Error("Title and site are required.");
  if (!(Object.values(IncidentSeverity) as string[]).includes(severity)) throw new Error("Invalid severity.");

  await prisma.incident.create({
    data: {
      title,
      description,
      siteId,
      severity: severity as IncidentSeverity,
      reportedBy: session.user.name ?? session.user.email ?? "Unknown",
    },
  });
  revalidatePath(PATH);
}

export async function updateIncidentStatus(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!(Object.values(IncidentStatus) as string[]).includes(status)) throw new Error("Invalid status.");
  await prisma.incident.update({ where: { id }, data: { status: status as IncidentStatus } });
  revalidatePath(PATH);
}
