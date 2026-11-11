import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { ASSIGNEE_KINDS, WORK_ORDER_STATUSES } from "@/lib/constants";
import { enumLabel, formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/form-fields";
import { CreateWorkOrderModal, LogRequestModal } from "./modals";
import { updateWorkOrder } from "./actions";

export const metadata = { title: "Work Orders" };

/**
 * Triage dashboard (Prompt 8): an Active Requests panel for ACCEPTED service
 * requests and a Work Order Management panel. Navigation-only: no metrics.
 */
export default async function WorkOrdersPage() {
  await requireRole(STAFF_ROLES);

  const [sites, residents, spaces, activeRequests, workOrders] = await Promise.all([
    prisma.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.resident.findMany({ orderBy: { lastName: "asc" }, select: { id: true, firstName: true, lastName: true, unit: true, siteId: true } }),
    prisma.space.findMany({ orderBy: { description: "asc" }, select: { id: true, siteId: true, description: true } }),
    prisma.serviceRequest.findMany({
      where: { status: "ACCEPTED" },
      orderBy: { createdAt: "asc" },
      include: { resident: { select: { firstName: true, lastName: true, unit: true } } },
    }),
    prisma.workOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        site: { select: { name: true } },
        space: { select: { description: true } },
        serviceRequests: { select: { number: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Order Triage"
        description="Review accepted service requests, consolidate them into work orders, and track execution."
        actions={
          <div className="flex flex-wrap gap-2">
            <LogRequestModal residents={residents.map((r) => ({ id: r.id, label: `${r.firstName} ${r.lastName} (${r.unit ?? "no unit"})` }))} />
            <CreateWorkOrderModal
              sites={sites}
              spaces={spaces.map((s) => ({ id: s.id, siteId: s.siteId, label: s.description }))}
              requests={activeRequests.map((r) => ({
                id: r.id,
                siteId: r.siteId,
                label: `${r.number} · ${r.type} · ${r.resident.firstName} ${r.resident.lastName}`,
              }))}
            />
          </div>
        }
      />

      {/* Active Requests Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Active Requests</CardTitle>
          <CardDescription>Service requests in ACCEPTED status awaiting triage.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Request #</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Resident</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {activeRequests.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{r.number}</td>
                  <td className="px-4 py-3">{enumLabel(r.category)}</td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3">
                    {r.resident.firstName} {r.resident.lastName} <span className="text-muted-foreground">({r.resident.unit ?? "—"})</span>
                  </td>
                  <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
              {activeRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No accepted requests waiting for triage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Work Order Management Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
          <CardDescription>Status flow: Open → In Progress → On Hold → Completed → Cancelled. Completing requires the actual cost.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workOrders.length === 0 && <p className="text-sm text-muted-foreground">No work orders yet.</p>}
          {workOrders.map((wo) => (
            <div key={wo.id} className="rounded-md border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{wo.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {wo.site.name}
                    {wo.space ? ` · ${wo.space.description}` : ""} · {enumLabel(wo.priority)} priority ·{" "}
                    {wo.serviceRequests.length} linked request{wo.serviceRequests.length === 1 ? "" : "s"}
                  </p>
                  {wo.description && <p className="mt-1 text-sm">{wo.description}</p>}
                </div>
                <Badge variant={wo.status === "COMPLETED" ? "success" : wo.status === "ON_HOLD" ? "warning" : "muted"}>
                  {enumLabel(wo.status)}
                </Badge>
              </div>

              <form action={updateWorkOrder} className="mt-4 grid gap-3 md:grid-cols-6 md:items-end">
                <input type="hidden" name="id" value={wo.id} />
                <div className="space-y-1">
                  <label htmlFor={`st-${wo.id}`} className="text-xs font-medium">Status</label>
                  <Select id={`st-${wo.id}`} name="status" defaultValue={wo.status}>
                    {WORK_ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {enumLabel(s)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <label htmlFor={`kind-${wo.id}`} className="text-xs font-medium">Assign to</label>
                  <Select id={`kind-${wo.id}`} name="assigneeKind" defaultValue={wo.assigneeKind ?? ""}>
                    <option value="">Unassigned</option>
                    {ASSIGNEE_KINDS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <label htmlFor={`as-${wo.id}`} className="text-xs font-medium">Assignee</label>
                  <Input id={`as-${wo.id}`} name="assignedTo" defaultValue={wo.assignedTo ?? ""} />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`cost-${wo.id}`} className="text-xs font-medium">
                    Actual cost (USD){wo.costApprovedAt ? ` · approved ${formatDate(wo.costApprovedAt)}` : ""}
                  </label>
                  <Input id={`cost-${wo.id}`} name="actualCost" type="number" step="0.01" min="0" defaultValue={wo.actualCost ? Number(wo.actualCost) : ""} />
                </div>
                <Button type="submit" variant="outline" className="md:col-span-2">
                  Update
                </Button>
              </form>
              {wo.actualCost && <p className="mt-2 text-xs text-muted-foreground">Recorded cost: {formatCurrency(Number(wo.actualCost))}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
