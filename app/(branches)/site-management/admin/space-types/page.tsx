import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { PageHeader } from "@/components/shared/NavCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Textarea } from "@/components/ui/form-fields";
import { createSpaceType, deleteSpaceType, updateSpaceType } from "./actions";

export const metadata = { title: "Maintain Space Types" };

/** Maintain Space Types: user-maintained list used by Space Roster, Add Space and Process Billing. */
export default async function SpaceTypesPage() {
  await requireRole(STAFF_ROLES);

  const types = await prisma.spaceType.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const usage = await Promise.all(
    types.map(async (t) => ({
      id: t.id,
      spaces: await prisma.space.count({ where: { spaceType: t.name } }),
      charges: await prisma.revenueEvent.count({ where: { spaceType: t.name } }),
    })),
  );
  const usageById = new Map(usage.map((u) => [u.id, u]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintain Space Types"
        description="Add, rename, reorder or deactivate the space types used across Site Management."
      />

      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Space Types</CardTitle>
          <CardDescription>
            Renaming a type updates every space and charge that uses it. Inactive types stay on existing records but cannot be chosen for new ones.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">In Use</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => {
                const u = usageById.get(t.id);
                const inUse = (u?.spaces ?? 0) + (u?.charges ?? 0) > 0;
                return (
                  <tr key={t.id} className="border-t align-top">
                    <td className="px-4 py-3">{t.sortOrder}</td>
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3">{t.description ?? "—"}</td>
                    <td className="px-4 py-3">
                      {u?.spaces ?? 0} space(s), {u?.charges ?? 0} charge(s)
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.isActive ? "success" : "muted"}>{t.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <details className="relative">
                          <summary className="cursor-pointer rounded px-2 py-1 text-sm hover:bg-accent">Edit</summary>
                          <form
                            action={updateSpaceType}
                            className="absolute right-0 z-10 mt-2 w-72 space-y-3 rounded-md border bg-card p-4 shadow-lg"
                          >
                            <input type="hidden" name="id" value={t.id} />
                            <Input name="name" defaultValue={t.name} required maxLength={60} aria-label="Space type name" />
                            <Textarea name="description" defaultValue={t.description ?? ""} aria-label="Description" />
                            <Input name="sortOrder" type="number" min={0} max={9999} defaultValue={t.sortOrder} aria-label="Sort order" />
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" name="isActive" defaultChecked={t.isActive} /> Active
                            </label>
                            <Button type="submit" size="sm">
                              Save
                            </Button>
                          </form>
                        </details>
                        {!inUse && (
                          <form action={deleteSpaceType}>
                            <input type="hidden" name="id" value={t.id} />
                            <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                              Delete
                            </Button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {types.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No space types yet. Add the first one below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <form action={createSpaceType} className="grid gap-3 border-t p-4 md:grid-cols-[2fr_2fr_1fr_auto_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="st-name">New space type</Label>
              <Input id="st-name" name="name" required maxLength={60} placeholder="e.g. Parking Stall" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="st-desc">Description</Label>
              <Input id="st-desc" name="description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="st-order">Sort order</Label>
              <Input id="st-order" name="sortOrder" type="number" min={0} max={9999} defaultValue={types.length + 1} />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </label>
            <Button type="submit">Add Space Type</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
