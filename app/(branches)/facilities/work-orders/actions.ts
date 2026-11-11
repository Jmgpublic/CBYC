"use server";

import { revalidatePath } from "next/cache";
import { AssigneeKind, Priority, ServiceCategory, WorkOrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { createServiceRequest } from "@/lib/service-requests";

const PATH = "/facilities/work-orders";

const pick = <T extends string>(value: FormDataEntryValue | null, allowed: readonly T[], label: string): T => {
  const s = String(value ?? "");
  if (!(allowed as readonly string[]).includes(s)) throw new Error(`Invalid ${label}.`);
  return s as T;
};

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const satisfies readonly Priority[];
const STATUSES = ["OPEN", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"] as const satisfies readonly WorkOrderStatus[];
const KINDS = ["INTERNAL_STAFF", "INTERNAL_RESIDENT", "EXTERNAL_VENDOR"] as const satisfies readonly AssigneeKind[];
const CATEGORIES = ["INFORMATION", "PERMISSION", "MAINTENANCE"] as const satisfies readonly ServiceCategory[];

/** Staff entry of a Service Request on a resident's behalf (Prompt 8, section 1). */
export async function logServiceRequest(formData: FormData) {
  await requireRole(STAFF_ROLES);
  await createServiceRequest({
    residentId: String(formData.get("residentId") ?? ""),
    category: pick(formData.get("category"), CATEGORIES, "category"),
    type: String(formData.get("type") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  revalidatePath(PATH);
}

/**
 * Create Work Order. Associates one or more ACCEPTED Service Requests
 * with a single consolidated work order.
 */
export async function createWorkOrder(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) throw new Error("Title is required.");

  const siteId = String(formData.get("siteId") ?? "");
  const spaceId = String(formData.get("spaceId") ?? "") || null;
  const requestIds = formData.getAll("serviceRequestIds").map(String).filter(Boolean);

  const requests = requestIds.length
    ? await prisma.serviceRequest.findMany({ where: { id: { in: requestIds }, status: "ACCEPTED" }, select: { id: true, siteId: true } })
    : [];
  if (requests.some((r) => r.siteId !== siteId)) throw new Error("All linked requests must belong to the selected site.");

  const assigneeKind = String(formData.get("assigneeKind") ?? "") as AssigneeKind | "";

  await prisma.$transaction(async (tx) => {
    const wo = await tx.workOrder.create({
      data: {
        title,
        description,
        siteId,
        spaceId,
        priority: pick(formData.get("priority"), PRIORITIES, "priority"),
        assignedTo: String(formData.get("assignedTo") ?? "").trim() || null,
        assigneeKind: assigneeKind && (KINDS as readonly string[]).includes(assigneeKind) ? assigneeKind : null,
      },
    });
    if (requests.length) {
      await tx.serviceRequest.updateMany({
        where: { id: { in: requests.map((r) => r.id) } },
        data: { status: "ASSIGNED", workOrderId: wo.id },
      });
    }
  });
  revalidatePath(PATH);
}

/**
 * Work Order Execution Lifecycle: update status, assignment and actual cost.
 * On COMPLETED, the actual cost is approved and a maintenance event is written
 * to the space history. Linked requests are closed.
 * On CANCELLED, linked requests return to ACCEPTED so triage can re-consolidate them.
 */
export async function updateWorkOrder(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  const status = pick(formData.get("status"), STATUSES, "status");
  const costRaw = String(formData.get("actualCost") ?? "").trim();
  const actualCost = costRaw === "" ? null : Number(costRaw);
  if (actualCost !== null && (!Number.isFinite(actualCost) || actualCost < 0)) throw new Error("Enter a valid cost.");

  const assigneeKindRaw = String(formData.get("assigneeKind") ?? "");
  const assigneeKind = (KINDS as readonly string[]).includes(assigneeKindRaw) ? (assigneeKindRaw as AssigneeKind) : null;

  await prisma.$transaction(async (tx) => {
    const wo = await tx.workOrder.findUniqueOrThrow({ where: { id } });

    const completing = status === "COMPLETED" && wo.status !== "COMPLETED";
    if (status === "COMPLETED" && actualCost === null) throw new Error("Enter the actual cost before completing.");

    await tx.workOrder.update({
      where: { id },
      data: {
        status,
        assignedTo: String(formData.get("assignedTo") ?? "").trim() || null,
        assigneeKind,
        actualCost: actualCost ?? undefined,
        costApprovedAt: completing ? new Date() : undefined,
      },
    });

    if (completing) {
      await tx.maintenanceEvent.create({
        data: {
          workOrderId: id,
          spaceId: wo.spaceId,
          description: `Completed: ${wo.title}`,
          cost: actualCost,
        },
      });
      await tx.serviceRequest.updateMany({ where: { workOrderId: id }, data: { status: "CLOSED" } });
    }

    if (status === "CANCELLED") {
      await tx.serviceRequest.updateMany({ where: { workOrderId: id }, data: { status: "ACCEPTED", workOrderId: null } });
    }
  });
  revalidatePath(PATH);
}
