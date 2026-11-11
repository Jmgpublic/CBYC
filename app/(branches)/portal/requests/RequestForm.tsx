"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { enumLabel } from "@/lib/utils";

export function RequestForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [confirmation, setConfirmation] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setConfirmation(null);
    setPending(true);
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/portal/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: f.get("category"),
        type: f.get("type"),
        description: f.get("description"),
      }),
    });
    setPending(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not submit your request.");
      return;
    }
    e.currentTarget.reset();
    setConfirmation(`Request ${data.number} received. Status: ${enumLabel(data.status)}.`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rq-cat">Category</Label>
          <Select id="rq-cat" name="category" defaultValue="MAINTENANCE">
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {enumLabel(c)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rq-type">Type</Label>
          <Input id="rq-type" name="type" required placeholder="e.g. Plumbing, Parking, Key" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rq-desc">Describe the request</Label>
        <Textarea id="rq-desc" name="description" required />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {confirmation && (
        <p role="status" className="text-sm text-emerald-700">
          {confirmation}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Submitting…" : "Submit Request"}
      </Button>
    </form>
  );
}
