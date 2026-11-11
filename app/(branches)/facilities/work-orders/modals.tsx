"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { ASSIGNEE_KINDS, PRIORITIES, SERVICE_CATEGORIES } from "@/lib/constants";
import { enumLabel } from "@/lib/utils";
import { createWorkOrder, logServiceRequest } from "./actions";

type Sites = { id: string; name: string }[];

/** Service Request entry on a resident's behalf. */
export function LogRequestModal({ residents }: { residents: { id: string; label: string }[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Log Service Request
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Log Service Request">
        <form
          action={async (fd) => {
            await logServiceRequest(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="lr-resident">Resident</Label>
            <Select id="lr-resident" name="residentId" required>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lr-cat">Category</Label>
              <Select id="lr-cat" name="category" defaultValue="MAINTENANCE">
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {enumLabel(c)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lr-type">Type</Label>
              <Input id="lr-type" name="type" required placeholder="e.g. Plumbing" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lr-desc">Description</Label>
            <Textarea id="lr-desc" name="description" required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

/** Create Work Order: consolidates one or more ACCEPTED service requests. */
export function CreateWorkOrderModal({
  sites,
  spaces,
  requests,
}: {
  sites: Sites;
  spaces: { id: string; siteId: string; label: string }[];
  requests: { id: string; siteId: string; label: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const [siteId, setSiteId] = React.useState(sites[0]?.id ?? "");
  const siteSpaces = spaces.filter((s) => s.siteId === siteId);
  const siteRequests = requests.filter((r) => r.siteId === siteId);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Work Order</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create Work Order" className="w-[min(92vw,40rem)]">
        <form
          action={async (fd) => {
            await createWorkOrder(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="wo-site">Site</Label>
              <Select id="wo-site" name="siteId" value={siteId} onChange={(e) => setSiteId(e.target.value)} required>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wo-space">Space (optional)</Label>
              <Select id="wo-space" name="spaceId" key={siteId}>
                <option value="">None</option>
                {siteSpaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wo-title">Title</Label>
            <Input id="wo-title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wo-desc">Description</Label>
            <Textarea id="wo-desc" name="description" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="wo-priority">Priority</Label>
              <Select id="wo-priority" name="priority" defaultValue="MEDIUM">
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {enumLabel(p)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wo-kind">Assign To</Label>
              <Select id="wo-kind" name="assigneeKind" defaultValue="">
                <option value="">Unassigned</option>
                {ASSIGNEE_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wo-assignee">Assignee Name</Label>
              <Input id="wo-assignee" name="assignedTo" />
            </div>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Accepted service requests to consolidate</legend>
            {siteRequests.length === 0 && <p className="text-sm text-muted-foreground">No accepted requests for this site.</p>}
            {siteRequests.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="serviceRequestIds" value={r.id} className="h-4 w-4" />
                {r.label}
              </label>
            ))}
          </fieldset>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Work Order</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
