import { RevenueStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { getSpaceTypes } from "@/lib/space-types";
import { formatCurrency, formatDate, enumLabel } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/form-fields";
import { processCharges, toggleHold, deleteRevenueEvent } from "./actions";
import { EditChargeModal } from "./EditChargeModal";

export const metadata = { title: "Process Billing" };

type SearchParams = Promise<{ cutoff?: string; siteId?: string; spaceType?: string; residentId?: string; preview?: string }>;

/** Process Billing (Prompt 9): filters, eligible-event table, row actions, Preview and Process. */
export default async function BillingPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole(STAFF_ROLES);
  const today = new Date().toISOString().slice(0, 10);
  const { cutoff = today, siteId = "", spaceType = "", residentId = "", preview } = await searchParams;
  const isPreview = preview === "1";

  const [sites, residents, spaceTypes] = await Promise.all([
    prisma.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.resident.findMany({ orderBy: { lastName: "asc" }, select: { id: true, firstName: true, lastName: true, unit: true } }),
    getSpaceTypes(),
  ]);

  const events = await prisma.revenueEvent.findMany({
    where: {
      status: { in: [RevenueStatus.FORECAST, RevenueStatus.HOLD] },
      dateProposed: { lte: new Date(`${cutoff}T23:59:59.999`) },
      ...(siteId ? { siteId } : {}),
      ...(spaceType ? { spaceType } : {}),
      ...(residentId ? { residentId } : {}),
    },
    include: { resident: { select: { firstName: true, lastName: true, unit: true } }, site: { select: { name: true } } },
    orderBy: { dateProposed: "asc" },
  });

  const total = events.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Process Billing" description="Review eligible forecast and held charges, then bill the selected events." />

      {/* Header filters */}
      <form method="get" className="grid gap-4 md:grid-cols-5 md:items-end">
        <div className="space-y-2">
          <Label htmlFor="cutoff">Billing Cutoff Date</Label>
          <Input id="cutoff" type="date" name="cutoff" defaultValue={cutoff} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siteId">Site</Label>
          <Select id="siteId" name="siteId" defaultValue={siteId}>
            <option value="">All sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="spaceType">Space Type</Label>
          <Select id="spaceType" name="spaceType" defaultValue={spaceType}>
            <option value="">All types</option>
            {spaceTypes.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="residentId">Tenant / Resident</Label>
          <Select id="residentId" name="residentId" defaultValue={residentId}>
            <option value="">All residents</option>
            {residents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.firstName} {r.lastName} ({r.unit ?? "no unit"})
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="outline">
            Filter
          </Button>
          <Button type="submit" variant="secondary" name="preview" value="1">
            Preview
          </Button>
        </div>
      </form>

      <Card className="p-4 text-sm">
        {events.length} eligible event{events.length === 1 ? "" : "s"} · Total {formatCurrency(total)} · Cutoff {formatDate(cutoff)}
        {isPreview && <span className="ml-2 text-muted-foreground">(preview only, nothing has been billed)</span>}
      </Card>

      {/* Eligible revenue events */}
      {isPreview ? (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Proposed</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Resident</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-3">{formatDate(e.dateProposed)}</td>
                  <td className="px-4 py-3">{e.site.name}</td>
                  <td className="px-4 py-3">{e.resident ? `${e.resident.firstName} ${e.resident.lastName}` : "—"}</td>
                  <td className="px-4 py-3">{e.description}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(e.amount))}</td>
                  <td className="px-4 py-3">{enumLabel(e.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <>
          {/* Standalone Process form. Checkboxes and the submit button attach via the `form` attribute,
              so row-level forms and the Edit modal are never nested inside it. */}
          <form id="process-charges" action={processCharges} />
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-4 py-3 font-medium">Proposed</th>
                  <th className="px-4 py-3 font-medium">Site</th>
                  <th className="px-4 py-3 font-medium">Resident</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        form="process-charges"
                        name="ids"
                        value={e.id}
                        disabled={e.status === RevenueStatus.HOLD}
                        aria-label={`Select ${e.description}`}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-4 py-3">{formatDate(e.dateProposed)}</td>
                    <td className="px-4 py-3">{e.site.name}</td>
                    <td className="px-4 py-3">{e.resident ? `${e.resident.firstName} ${e.resident.lastName}` : "—"}</td>
                    <td className="px-4 py-3">{e.description}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(Number(e.amount))}</td>
                    <td className="px-4 py-3">
                      <Badge variant={e.status === RevenueStatus.HOLD ? "warning" : "muted"}>{enumLabel(e.status)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <EditChargeModal id={e.id} description={e.description} amount={Number(e.amount)} />
                        <form action={toggleHold}>
                          <input type="hidden" name="id" value={e.id} />
                          <Button type="submit" variant="ghost" size="sm">
                            {e.status === RevenueStatus.HOLD ? "Release" : "Hold"}
                          </Button>
                        </form>
                        <form action={deleteRevenueEvent}>
                          <input type="hidden" name="id" value={e.id} />
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No eligible events for these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
          <div className="mt-4 flex justify-end">
            <Button type="submit" form="process-charges">
              Process Selected Charges
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
