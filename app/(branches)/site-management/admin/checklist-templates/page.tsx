import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { CHECKLIST_BRANCHES, RESPONSIBLE_ROLES } from "@/lib/constants";
import { enumLabel } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { CreateTemplateModal } from "./CreateTemplateModal";
import { addItem, deleteItem, moveItem, updateItem, updateTemplate } from "./actions";

export const metadata = { title: "Checklist Templates" };

type SearchParams = Promise<{ branch?: string; scope?: string; siteId?: string; template?: string }>;

/** Checklist Template Management (Prompt 10), filtered by branch and by global/site scope. */
export default async function ChecklistTemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole(STAFF_ROLES);
  const { branch = "", scope = "global", siteId = "", template: selectedId = "" } = await searchParams;

  const sites = await prisma.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  const templates = await prisma.checklistTemplate.findMany({
    where: {
      ...(branch ? { branch: branch as (typeof CHECKLIST_BRANCHES)[number]["value"] } : {}),
      ...(scope === "site"
        ? siteId
          ? { siteId }
          : { siteId: { not: null } }
        : { siteId: null }),
    },
    orderBy: [{ branch: "asc" }, { name: "asc" }],
    include: { site: { select: { name: true } } },
  });

  const selected = selectedId
    ? await prisma.checklistTemplate.findUnique({
        where: { id: selectedId },
        include: { site: { select: { name: true } }, items: { orderBy: { orderIndex: "asc" } } },
      })
    : null;

  const query = (overrides: Record<string, string>) => {
    const q = new URLSearchParams({ branch, scope, siteId, ...overrides });
    for (const [k, v] of [...q.entries()]) if (!v) q.delete(k);
    return `?${q.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Checklist Templates"
        description="Global default templates and site-specific overrides, filtered by branch."
        actions={<CreateTemplateModal sites={sites} defaultBranch={branch || undefined} />}
      />

      {/* Header controls */}
      <form method="get" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Select id="branch" name="branch" defaultValue={branch}>
            <option value="">All branches</option>
            {CHECKLIST_BRANCHES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scope">Site Scope</Label>
          <Select id="scope" name="scope" defaultValue={scope}>
            <option value="global">Global Default Templates</option>
            <option value="site">Site-Specific Overrides</option>
          </Select>
        </div>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Template list */}
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.length === 0 && <p className="text-sm text-muted-foreground">No templates match these filters.</p>}
            {templates.map((t) => (
              <Link
                key={t.id}
                href={query({ template: t.id })}
                className={`block rounded-md border p-3 text-sm hover:bg-accent/50 ${t.id === selectedId ? "border-primary bg-accent/50" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{t.name}</span>
                  <Badge variant={t.isActive ? "success" : "muted"}>{t.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {enumLabel(t.branch)} · v{t.version} · {t.site ? t.site.name : "Global default"}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Template editor and item builder */}
        <div className="space-y-6">
          {!selected && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">Select a template to edit its metadata and items.</CardContent>
            </Card>
          )}

          {selected && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Template Metadata</CardTitle>
                  <CardDescription>
                    Version {selected.version} · {selected.site ? `Override for ${selected.site.name}` : "Global default"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={updateTemplate} className="grid gap-4 sm:grid-cols-2">
                    <input type="hidden" name="id" value={selected.id} />
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="t-name">Template Name</Label>
                      <Input id="t-name" name="name" defaultValue={selected.name} required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="t-desc">Description</Label>
                      <Textarea id="t-desc" name="description" defaultValue={selected.description ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="t-branch">Assigned Branch</Label>
                      <Select id="t-branch" name="branch" defaultValue={selected.branch}>
                        {CHECKLIST_BRANCHES.map((b) => (
                          <option key={b.value} value={b.value}>
                            {b.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="t-role">Target Role</Label>
                      <Select id="t-role" name="targetRole" defaultValue={selected.targetRole}>
                        {RESPONSIBLE_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                      <input type="checkbox" name="isActive" defaultChecked={selected.isActive} className="h-4 w-4" />
                      Active (uncheck to retire this version)
                    </label>
                    <div className="sm:col-span-2">
                      <Button type="submit">Save Metadata</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="overflow-x-auto">
                <CardHeader>
                  <CardTitle>Item Builder</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">#</th>
                        <th className="px-4 py-3 font-medium">Item Description</th>
                        <th className="px-4 py-3 font-medium">Required</th>
                        <th className="px-4 py-3 font-medium">Document</th>
                        <th className="px-4 py-3 font-medium">Responsible</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((item, idx) => (
                        <tr key={item.id} className="border-t align-top">
                          <td className="px-4 py-3">{item.orderIndex}</td>
                          <td className="px-4 py-3">{item.description}</td>
                          <td className="px-4 py-3">{item.isRequired ? "Required" : "Optional"}</td>
                          <td className="px-4 py-3">{item.requiresDocument ? "Attachment required" : "—"}</td>
                          <td className="px-4 py-3">{enumLabel(item.responsibleRole)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-1">
                              <form action={moveItem}>
                                <input type="hidden" name="id" value={item.id} />
                                <input type="hidden" name="direction" value="up" />
                                <Button type="submit" variant="ghost" size="sm" disabled={idx === 0} aria-label="Move up">
                                  ↑
                                </Button>
                              </form>
                              <form action={moveItem}>
                                <input type="hidden" name="id" value={item.id} />
                                <input type="hidden" name="direction" value="down" />
                                <Button type="submit" variant="ghost" size="sm" disabled={idx === selected.items.length - 1} aria-label="Move down">
                                  ↓
                                </Button>
                              </form>
                              <details className="relative">
                                <summary className="cursor-pointer rounded px-2 py-1 text-sm hover:bg-accent">Edit</summary>
                                <form action={updateItem} className="absolute right-0 z-10 mt-2 w-72 space-y-3 rounded-md border bg-card p-4 shadow-lg">
                                  <input type="hidden" name="id" value={item.id} />
                                  <Input name="description" defaultValue={item.description} aria-label="Item description" />
                                  <Select name="responsibleRole" defaultValue={item.responsibleRole}>
                                    {RESPONSIBLE_ROLES.map((r) => (
                                      <option key={r.value} value={r.value}>
                                        {r.label}
                                      </option>
                                    ))}
                                  </Select>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" name="isRequired" defaultChecked={item.isRequired} /> Required
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" name="requiresDocument" defaultChecked={item.requiresDocument} /> Requires document
                                  </label>
                                  <Button type="submit" size="sm">
                                    Save Item
                                  </Button>
                                </form>
                              </details>
                              <form action={deleteItem}>
                                <input type="hidden" name="id" value={item.id} />
                                <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                                  Delete
                                </Button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {selected.items.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                            No items yet. Add the first one below.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <form action={addItem} className="grid gap-3 border-t p-4 md:grid-cols-[2fr_1fr_auto_auto_auto] md:items-end">
                    <input type="hidden" name="templateId" value={selected.id} />
                    <div className="space-y-2">
                      <Label htmlFor="new-item">New item</Label>
                      <Input id="new-item" name="description" required placeholder="Item description" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-role">Responsible</Label>
                      <Select id="new-role" name="responsibleRole" defaultValue="STAFF">
                        {RESPONSIBLE_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <label className="flex items-center gap-2 pb-2 text-sm">
                      <input type="checkbox" name="isRequired" defaultChecked /> Required
                    </label>
                    <label className="flex items-center gap-2 pb-2 text-sm">
                      <input type="checkbox" name="requiresDocument" /> Document
                    </label>
                    <Button type="submit">Add Item</Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
