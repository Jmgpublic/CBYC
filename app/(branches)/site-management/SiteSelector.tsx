"use client";

import * as React from "react";
import { Label, Select } from "@/components/ui/form-fields";
import { setActiveSite } from "./actions";

/** Dashboard dropdown that scopes Site Management pages (roster, residents, leases) to one site. */
export function SiteSelector({ sites, activeSiteId }: { sites: { id: string; name: string }[]; activeSiteId: string }) {
  const [value, setValue] = React.useState(activeSiteId);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  // Keep the dropdown in sync when the server re-renders with a different active site.
  React.useEffect(() => setValue(activeSiteId), [activeSiteId]);

  return (
    <div className="max-w-md space-y-2">
      <Label htmlFor="active-site">Filter Site Management to</Label>
      <Select
        id="active-site"
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          setError(null);
          startTransition(async () => {
            try {
              await setActiveSite(next);
            } catch (err) {
              setValue(activeSiteId);
              setError(err instanceof Error ? err.message : "Could not change site.");
            }
          });
        }}
      >
        <option value="">All sites</option>
        {sites.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
