"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { createCase } from "./actions";

export function CaseModal({ residents }: { residents: { id: string; label: string }[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>New Case</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="New Case">
        <form
          action={async (fd) => {
            await createCase(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="case-title">Title</Label>
            <Input id="case-title" name="title" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="case-cat">Category</Label>
              <Input id="case-cat" name="category" required placeholder="e.g. Community Standards" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="case-res">Resident (optional)</Label>
              <Select id="case-res" name="residentId" defaultValue="">
                <option value="">None</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="case-desc">Description</Label>
            <Textarea id="case-desc" name="description" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Case</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
