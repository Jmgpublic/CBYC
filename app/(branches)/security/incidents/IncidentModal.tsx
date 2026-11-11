"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { INCIDENT_SEVERITIES } from "@/lib/constants";
import { enumLabel } from "@/lib/utils";
import { createIncident } from "./actions";

export function IncidentModal({ sites }: { sites: { id: string; name: string }[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Report Incident</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Report Incident">
        <form
          action={async (fd) => {
            await createIncident(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="inc-title">Title</Label>
            <Input id="inc-title" name="title" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inc-site">Site</Label>
              <Select id="inc-site" name="siteId" required>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inc-sev">Severity</Label>
              <Select id="inc-sev" name="severity" defaultValue="LOW">
                {INCIDENT_SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {enumLabel(s)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inc-desc">Description</Label>
            <Textarea id="inc-desc" name="description" required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
