import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { CASE_STATUSES } from "@/lib/constants";
import { enumLabel, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form-fields";
import { CaseModal } from "./CaseModal";
import { updateCase } from "./actions";

export const metadata = { title: "Cases" };

export default async function CaseRecordsPage() {
  await requireRole(STAFF_ROLES);
  const [cases, residents] = await Promise.all([
    prisma.case.findMany({
      orderBy: { createdAt: "desc" },
      include: { resident: { select: { firstName: true, lastName: true, unit: true } } },
    }),
    prisma.resident.findMany({ orderBy: { lastName: "asc" }, select: { id: true, firstName: true, lastName: true, unit: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        description="Case records for residents and community matters."
        actions={<CaseModal residents={residents.map((r) => ({ id: r.id, label: `${r.firstName} ${r.lastName} (${r.unit ?? "no unit"})` }))} />}
      />

      {cases.length === 0 && <p className="text-sm text-muted-foreground">No cases yet.</p>}
      <div className="space-y-4">
        {cases.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c.category} · Opened {formatDate(c.createdAt)}
                  {c.resident ? ` · ${c.resident.firstName} ${c.resident.lastName}` : ""}
                </p>
                {c.description && <p className="mt-2 text-sm">{c.description}</p>}
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{enumLabel(c.status)}</span>
            </div>
            <form action={updateCase} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end">
              <input type="hidden" name="id" value={c.id} />
              <div className="space-y-1">
                <label htmlFor={`cs-${c.id}`} className="text-xs font-medium">Status</label>
                <Select id={`cs-${c.id}`} name="status" defaultValue={c.status}>
                  {CASE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {enumLabel(s)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label htmlFor={`ca-${c.id}`} className="text-xs font-medium">Assigned to</label>
                <Input id={`ca-${c.id}`} name="assignedTo" defaultValue={c.assignedTo ?? ""} />
              </div>
              <div className="space-y-1">
                <label htmlFor={`cr-${c.id}`} className="text-xs font-medium">Resolution</label>
                <Input id={`cr-${c.id}`} name="resolution" defaultValue={c.resolution ?? ""} />
              </div>
              <Button type="submit" variant="outline">
                Update
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
