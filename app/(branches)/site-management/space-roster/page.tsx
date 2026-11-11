import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { getSpaceTypes } from "@/lib/space-types";
import { getActiveSite } from "@/lib/active-site";
import { formatDate, enumLabel, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, Label } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { AddSpaceModal } from "./AddSpaceModal";
import { SpaceTypeGroup } from "./SpaceTypeGroup";
import { ActiveSiteNotice } from "../ActiveSiteNotice";

export const metadata = { title: "Space Roster" };

type SearchParams = Promise<{ type?: string; space?: string; site?: string }>;

/** Space Roster (Prompt 7): filters, table with Add Space, and a detail footer for the selected row. Site scope comes from the Site dropdown (?site=), defaulting to the dashboard's active site. */
export default async function SpaceRosterPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole(STAFF_ROLES);
  const { type = "", space: selectedId = "", site: siteParam } = await searchParams;
  const activeSite = await getActiveSite();

  const [sites, spaceTypes] = await Promise.all([
    prisma.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getSpaceTypes({ activeOnly: true }),
  ]);

  // An explicit dropdown choice wins ("" = all sites); an unknown id falls back to all sites.
  // With no ?site= param at all, use the dashboard's active site.
  const siteId =
    siteParam !== undefined ? (sites.some((s) => s.id === siteParam) ? siteParam : "") : (activeSite?.id ?? "");
  const siteName = sites.find((s) => s.id === siteId)?.name ?? null;

  const spaces = await prisma.space.findMany({
    where: {
      ...(siteId ? { siteId } : {}),
      ...(type ? { spaceType: type } : {}),
    },
    include: { site: { select: { name: true } } },
    orderBy: [{ site: { name: "asc" } }, { description: "asc" }],
  });

  // Group rows by space type; each group header carries its total and vacant counts.
  const groupsByType = new Map<string, typeof spaces>();
  for (const s of spaces) {
    const list = groupsByType.get(s.spaceType) ?? [];
    list.push(s);
    groupsByType.set(s.spaceType, list);
  }
  const groups = [...groupsByType.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([spaceType, rows]) => ({
      spaceType,
      rows,
      vacant: rows.filter((r) => r.status === "VACANT").length,
    }));

  const selected = selectedId
    ? await prisma.space.findUnique({
        where: { id: selectedId },
        include: {
          site: { select: { name: true } },
          maintenanceEvents: { orderBy: { createdAt: "desc" }, take: 10 },
          workOrders: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, status: true, createdAt: true } },
        },
      })
    : null;

  const filterQuery = (overrides: Record<string, string>) => {
    const q = new URLSearchParams({ type, ...(siteParam !== undefined ? { site: siteId } : {}), ...overrides });
    return `?${q.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Space Roster"
        description="Spaces at the selected site. Select a row to view its details."
        actions={<AddSpaceModal sites={sites} spaceTypes={spaceTypes.map((t) => t.name)} defaultSiteId={siteId || undefined} />}
      />

      <ActiveSiteNotice siteName={siteName} />

      {/* Header filters */}
      <form method="get" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="site">Site</Label>
          <Select id="site" name="site" defaultValue={siteId}>
            <option value="">All sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Space Type</Label>
          <Select id="type" name="type" defaultValue={type}>
            <option value="">All types</option>
            {spaceTypes.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">
          Apply Filters
        </Button>
      </form>

      {/* Body table */}
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Site Name</th>
              <th className="px-4 py-3 font-medium">Description / Name</th>
              <th className="px-4 py-3 font-medium">Space Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <SpaceTypeGroup key={g.spaceType} spaceType={g.spaceType} total={g.rows.length} vacant={g.vacant}>
                {g.rows.map((s) => {
                  const isSelected = s.id === selectedId;
                  return (
                    <tr key={s.id} className={isSelected ? "border-t bg-accent/60" : "border-t hover:bg-accent/30"}>
                      <td className="px-4 py-3">{s.site.name}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link href={filterQuery({ space: s.id })} className="hover:underline">
                          {s.description}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{s.spaceType}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.status === "OCCUPIED" ? "success" : s.status === "MAINTENANCE" ? "warning" : "muted"}>
                          {enumLabel(s.status)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </SpaceTypeGroup>
            ))}
            {spaces.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No spaces match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Footer / detail panel */}
      <Card>
        <CardHeader>
          <CardTitle>{selected ? selected.description : "Space details"}</CardTitle>
        </CardHeader>
        <CardContent>
          {!selected && <p className="text-sm text-muted-foreground">Select a space in the table to view its metadata, history and occupancy.</p>}
          {selected && (
            <div className="grid gap-6 text-sm md:grid-cols-3">
              <div className="space-y-1">
                <p className="font-medium">Metadata</p>
                <p>Site: {selected.site.name}</p>
                <p>Type: {selected.spaceType}</p>
                <p>Created: {formatDate(selected.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Occupancy</p>
                <p>Status: {enumLabel(selected.status)}</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">History</p>
                {selected.maintenanceEvents.length === 0 && <p className="text-muted-foreground">No maintenance events recorded.</p>}
                <ul className="space-y-1">
                  {selected.maintenanceEvents.map((e) => (
                    <li key={e.id}>
                      {formatDateTime(e.createdAt)} – {e.description}
                    </li>
                  ))}
                </ul>
                {selected.workOrders.length > 0 && (
                  <>
                    <p className="pt-2 font-medium">Recent work orders</p>
                    <ul className="space-y-1">
                      {selected.workOrders.map((w) => (
                        <li key={w.id}>
                          {w.title} <span className="text-muted-foreground">({enumLabel(w.status)})</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
