import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { INCIDENT_SEVERITIES, INCIDENT_STATUSES } from "@/lib/constants";
import { enumLabel, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/form-fields";
import { IncidentModal } from "./IncidentModal";
import { updateIncidentStatus } from "./actions";

export const metadata = { title: "Incidents" };

export default async function IncidentsPage() {
  await requireRole(STAFF_ROLES);
  const [sites, incidents] = await Promise.all([
    prisma.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.incident.findMany({ orderBy: { createdAt: "desc" }, include: { site: { select: { name: true } } } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Incidents" description="Log and track security incidents across sites." actions={<IncidentModal sites={sites} />} />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Reported</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Site</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="border-t align-top">
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(i.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">{i.description}</p>
                  <p className="text-xs text-muted-foreground">Reported by {i.reportedBy}</p>
                </td>
                <td className="px-4 py-3">{i.site.name}</td>
                <td className="px-4 py-3">
                  <Badge variant={i.severity === "CRITICAL" || i.severity === "HIGH" ? "danger" : i.severity === "MEDIUM" ? "warning" : "muted"}>
                    {enumLabel(i.severity)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <form action={updateIncidentStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={i.id} />
                    <Select name="status" defaultValue={i.status} aria-label={`Status for ${i.title}`} className="h-8 py-1">
                      {INCIDENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {enumLabel(s)}
                        </option>
                      ))}
                    </Select>
                    <Button type="submit" variant="ghost" size="sm">
                      Save
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
            {incidents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No incidents logged.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-muted-foreground">Severity options: {INCIDENT_SEVERITIES.map(enumLabel).join(", ")}.</p>
    </div>
  );
}
