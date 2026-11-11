import { prisma } from "@/lib/prisma";
import { getActiveSite } from "@/lib/active-site";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { PageHeader } from "@/components/shared/NavCard";
import { Card } from "@/components/ui/card";
import { ActiveSiteNotice } from "../ActiveSiteNotice";

export const metadata = { title: "Residents" };

export default async function ResidentsPage() {
  await requireRole(STAFF_ROLES);
  const activeSite = await getActiveSite();
  const residents = await prisma.resident.findMany({
    where: activeSite ? { siteId: activeSite.id } : {},
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { site: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader title="Residents" description="Tenant directory for the selected site." />
      <div className="mb-4">
        <ActiveSiteNotice siteName={activeSite?.name ?? null} />
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Site</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Portal Login</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-medium">
                  {r.firstName} {r.lastName}
                </td>
                <td className="px-4 py-3">{r.site.name}</td>
                <td className="px-4 py-3">{r.unit ?? "—"}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.phone ?? "—"}</td>
                <td className="px-4 py-3">{r.userId ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
