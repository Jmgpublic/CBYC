import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/session";
import { PageHeader } from "@/components/shared/NavCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form-fields";
import { createSite } from "../actions";

export const metadata = { title: "Site Configuration" };

export default async function SiteConfigurationPage() {
  await requireRole(ADMIN_ROLES);
  const sites = await prisma.site.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <PageHeader title="Site Configuration" description="Sites available across Concierge." />

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
          </tbody>
        </table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Site</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSite} className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="s-name">Name</Label>
              <Input id="s-name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-address">Address</Label>
              <Input id="s-address" name="address" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-city">City</Label>
              <Input id="s-city" name="city" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-state">State</Label>
              <Input id="s-state" name="state" required maxLength={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-zip">ZIP</Label>
              <Input id="s-zip" name="zip" required />
            </div>
            <div className="flex items-end">
              <Button type="submit">Add Site</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
