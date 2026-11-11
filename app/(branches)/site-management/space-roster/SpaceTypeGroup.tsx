"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Collapsible group header for the Space Roster table. Rows are rendered by the server and passed in as children. */
export function SpaceTypeGroup({
  spaceType,
  total,
  vacant,
  children,
}: {
  spaceType: string;
  total: number;
  vacant: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <tr>
        <td colSpan={4} className="border-y-2 border-border bg-muted/40 p-0">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex w-full flex-wrap items-center justify-between gap-x-10 gap-y-2 px-4 py-3 text-left text-sm hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center gap-2">
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", !open && "-rotate-90")} aria-hidden />
              <span className="font-semibold">{spaceType}</span>
            </span>
            <span className="flex flex-wrap items-center gap-x-10 gap-y-1">
              <span className="text-muted-foreground">
                Units: <span className="font-medium text-foreground">{total}</span>
              </span>
              <span className="text-muted-foreground">
                Vacant: <span className="font-medium text-foreground">{vacant}</span>
              </span>
            </span>
          </button>
        </td>
      </tr>
      {open && children}
    </>
  );
}
