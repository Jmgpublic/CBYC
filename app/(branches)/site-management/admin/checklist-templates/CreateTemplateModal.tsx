"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { CHECKLIST_BRANCHES, RESPONSIBLE_ROLES } from "@/lib/constants";
import { createTemplate } from "./actions";

export function CreateTemplateModal({
  sites,
  defaultBranch,
}: {
  sites: { id: string; name: string }[];
  defaultBranch?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create New Checklist Template</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create New Checklist Template">
        <form
          action={async (fd) => {
            await createTemplate(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="ct-name">Template Name</Label>
            <Input id="ct-name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ct-desc">Description</Label>
            <Textarea id="ct-desc" name="description" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ct-branch">Assigned Branch</Label>
              <Select id="ct-branch" name="branch" defaultValue={defaultBranch ?? CHECKLIST_BRANCHES[0].value}>
                {CHECKLIST_BRANCHES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ct-role">Target Role</Label>
              <Select id="ct-role" name="targetRole" defaultValue="STAFF">
                {RESPONSIBLE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ct-site">Scope</Label>
            <Select id="ct-site" name="siteId" defaultValue="">
              <option value="">Global Default Template</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  Override for {s.name}
                </option>
              ))}
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4" /> Active
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Template</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
