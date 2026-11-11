import { ServiceCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Generates a human-readable Service Request Number, e.g. SR-20261108-4F7A. */
export function newServiceRequestNumber(now = new Date()) {
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SR-${ymd}-${rand}`;
}

/**
 * Creates a Service Request with status ACCEPTED and a timestamp.
 * Callers must pass a residentId they have already authorized:
 * portal callers use the session residentId, staff callers pick a resident.
 */
export async function createServiceRequest(input: {
  residentId: string;
  category: ServiceCategory;
  type: string;
  description: string;
}) {
  const resident = await prisma.resident.findUniqueOrThrow({ where: { id: input.residentId }, select: { id: true, siteId: true } });
  const type = input.type.trim();
  const description = input.description.trim();
  if (!type || !description) throw new Error("Type and description are required.");

  return prisma.serviceRequest.create({
    data: {
      number: newServiceRequestNumber(),
      residentId: resident.id,
      siteId: resident.siteId,
      category: input.category,
      type,
      description,
      status: "ACCEPTED",
    },
  });
}
