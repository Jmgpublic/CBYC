"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea } from "@/components/ui/form-fields";
import { BULLETIN_DEFAULT_HOURS, BULLETIN_LIMITS } from "@/lib/bulletin-rules";
import { createBulletin } from "@/lib/bulletin-actions";

/** "New Bulletin" button and entry form. Available on every dashboard and the resident portal. */
export function NewBulletinModal({ label = "New Bulletin", className }: { label?: string; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await createBulletin(new FormData(e.currentTarget));
    setPending(false);
    if (result.ok) {
      setOpen(false);
    } else {
      setError(result.error);
    }
  }

  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Enter a Bulletin">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bulletin-to">To</Label>
              <Input id="bulletin-to" name="msgTo" maxLength={BULLETIN_LIMITS.to} placeholder="e.g. All residents" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulletin-from">From</Label>
              <Input id="bulletin-from" name="msgFrom" maxLength={BULLETIN_LIMITS.from} placeholder="e.g. Front desk" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulletin-msg">Message</Label>
            <Textarea id="bulletin-msg" name="msg" required maxLength={BULLETIN_LIMITS.msg} placeholder={`Up to ${BULLETIN_LIMITS.msg} characters`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bulletin-start">Start (blank = now)</Label>
              <Input id="bulletin-start" name="msgStart" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulletin-end">End (blank = start + {BULLETIN_DEFAULT_HOURS} hours)</Label>
              <Input id="bulletin-end" name="msgEnd" type="datetime-local" />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
