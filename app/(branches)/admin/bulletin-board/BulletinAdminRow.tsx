"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea } from "@/components/ui/form-fields";
import { BULLETIN_LIMITS, type BulletinStatus } from "@/lib/bulletin-rules";
import { deleteBulletin, reviewBulletin, updateBulletin } from "@/lib/bulletin-actions";

export type AdminBulletin = {
  id: string;
  msgTo: string | null;
  msgFrom: string | null;
  msg: string;
  msgStart: Date;
  msgEnd: Date;
  /** Preformatted on the server so the table renders identically before and after hydration. */
  startLabel: string;
  endLabel: string;
  approved: boolean;
  rejected: boolean | null;
  status: BulletinStatus;
};

/** Converts a Date to the local "YYYY-MM-DDTHH:mm" value a datetime-local input expects. */
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** One row of the Admin bulletin table: approve, reject, restore, edit and delete. */
export function BulletinAdminRow({ b }: { b: AdminBulletin }) {
  const [editing, setEditing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function review(decision: "approve" | "reject" | "restore") {
    setError(null);
    setPending(true);
    const fd = new FormData();
    fd.set("id", b.id);
    fd.set("decision", decision);
    const result = await reviewBulletin(fd);
    setPending(false);
    if (!result.ok) setError(result.error);
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await updateBulletin(new FormData(e.currentTarget));
    setPending(false);
    if (result.ok) setEditing(false);
    else setError(result.error);
  }

  async function onDelete() {
    if (!window.confirm("Delete this bulletin permanently?")) return;
    setError(null);
    setPending(true);
    const fd = new FormData();
    fd.set("id", b.id);
    const result = await deleteBulletin(fd);
    setPending(false);
    if (result.ok) setEditing(false);
    else setError(result.error);
  }

  return (
      <tr className="border-t align-top">
        <td className="px-4 py-3">{b.status}</td>
        <td className="max-w-xs px-4 py-3">{b.msg}</td>
        <td className="px-4 py-3">{b.msgTo ?? "—"}</td>
        <td className="px-4 py-3">{b.msgFrom ?? "—"}</td>
        <td className="px-4 py-3 whitespace-nowrap">{b.startLabel}</td>
        <td className="px-4 py-3 whitespace-nowrap">{b.endLabel}</td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="ghost" disabled={pending || b.approved} onClick={() => review("approve")}>
              Approve
            </Button>
            {b.rejected === true ? (
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => review("restore")}>
                Restore
              </Button>
            ) : (
              <Button size="sm" variant="ghost" className="text-destructive" disabled={pending} onClick={() => review("reject")}>
                Reject
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </div>
          {error && !editing && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {error}
            </p>
          )}

          {/* Rendered inside the cell (not beside the row) so the table markup stays valid. */}
          <Modal open={editing} onClose={() => setEditing(false)} title="Edit Bulletin">
        <form onSubmit={onSave} className="space-y-4">
          <input type="hidden" name="id" value={b.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`to-${b.id}`}>To</Label>
              <Input id={`to-${b.id}`} name="msgTo" defaultValue={b.msgTo ?? ""} maxLength={BULLETIN_LIMITS.to} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`from-${b.id}`}>From</Label>
              <Input id={`from-${b.id}`} name="msgFrom" defaultValue={b.msgFrom ?? ""} maxLength={BULLETIN_LIMITS.from} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`msg-${b.id}`}>Message</Label>
            <Textarea id={`msg-${b.id}`} name="msg" required defaultValue={b.msg} maxLength={BULLETIN_LIMITS.msg} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`start-${b.id}`}>Start</Label>
              <Input id={`start-${b.id}`} name="msgStart" type="datetime-local" required defaultValue={toLocalInput(b.msgStart)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`end-${b.id}`}>End</Label>
              <Input id={`end-${b.id}`} name="msgEnd" type="datetime-local" required defaultValue={toLocalInput(b.msgEnd)} />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <Button type="button" variant="destructive" disabled={pending} onClick={onDelete}>
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                Save
              </Button>
            </div>
          </div>
        </form>
          </Modal>
        </td>
      </tr>
  );
}
