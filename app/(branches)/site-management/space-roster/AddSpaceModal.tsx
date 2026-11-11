"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/form-fields";
import { SPACE_STATUSES } from "@/lib/constants";
import { enumLabel } from "@/lib/utils";
import { createSpace } from "./actions";

export function AddSpaceModal({
  sites,
  spaceTypes,
  defaultSiteId,
}: {
  sites: { id: string; name: string }[];
  spaceTypes: string[];
  defaultSiteId?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Space</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Space">
        <form
          action={async (fd) => {
            await createSpace(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="siteId">Site</Label>
            <Select id="siteId" name="siteId" defaultValue={defaultSiteId ?? sites[0]?.id} required>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="spaceType">Space Type</Label>
            <Select id="spaceType" name="spaceType" required defaultValue={spaceTypes[0]}>
              {spaceTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description / Name</Label>
            <Input id="description" name="description" required placeholder="e.g. Unit A-103" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue="VACANT">
              {SPACE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {enumLabel(s)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Space</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
