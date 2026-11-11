import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { PageHeader } from "@/components/shared/NavCard";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Sites" };

export default async function SitesPage() {
  await requireRole(STAFF_ROLES);
  const sites = await prisma.site.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Sites" description="Sites managed by Concierge." />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3 font-medium">ZIP</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.address}</td>
                <td className="px-4 py-3">{s.city}</td>
                <td className="px-4 py-3">{s.state}</td>
                <td className="px-4 py-3">{s.zip}</td>
              </tr>
            ))}
            {sites.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No sites yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
