"use client";

import * as React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bell, ChevronDown } from "lucide-react";
import { TOP_NAV_STAFF_BRANCHES, BRANCHES } from "@/lib/branches";
import { cn } from "@/lib/utils";

type Props = { name: string; email?: string | null; role: string };

/** Global top navigation: brand, branch links, notification placeholder and user menu (Prompt 2). */
export function TopNav({ name, email, role }: Props) {
  const isResident = role === "RESIDENT";
  const branchLinks = isResident
    ? BRANCHES.filter((b) => b.key === "portal")
    : TOP_NAV_STAFF_BRANCHES;

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="flex h-14 items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">C</span>
          Concierge
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Branches">
          {branchLinks.map((b) => (
            <Link
              key={b.key}
              href={b.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {b.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="relative rounded-md p-2 text-muted-foreground hover:bg-accent"
            title="Notifications (coming soon)"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <UserMenu name={name} email={email} />
        </div>
      </div>

      {/* Compact branch links for small screens */}
      <nav className="flex gap-1 overflow-x-auto border-t px-4 py-2 md:hidden" aria-label="Branches (mobile)">
        {branchLinks.map((b) => (
          <Link key={b.key} href={b.href} className="whitespace-nowrap rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-accent">
            {b.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function UserMenu({ name, email }: { name: string; email?: string | null }) {
  const [open, setOpen] = React.useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold">{initials}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 rounded-md border bg-card p-1 shadow-lg">
          <div className="px-3 py-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{name}</p>
            <p className="truncate">{email}</p>
          </div>
          <hr className="my-1" />
          <Link role="menuitem" href="/account/profile" onClick={() => setOpen(false)} className="block rounded px-3 py-2 text-sm hover:bg-accent">
            Profile
          </Link>
          <Link role="menuitem" href="/account/settings" onClick={() => setOpen(false)} className="block rounded px-3 py-2 text-sm hover:bg-accent">
            Settings
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-accent"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
