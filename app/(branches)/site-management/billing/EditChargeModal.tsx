"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/form-fields";
import { updateChargeAmount } from "./actions";

export function EditChargeModal({ id, description, amount }: { id: string; description: string; amount: number }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Edit ${description}`}>
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Adjust Proposed Amount">
        <form
          action={async (fd) => {
            await updateChargeAmount(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={id} />
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="space-y-2">
            <Label htmlFor={`amount-${id}`}>Amount (USD)</Label>
            <Input id={`amount-${id}`} name="amount" type="number" step="0.01" min="0" defaultValue={amount} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
