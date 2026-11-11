"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { branchForPath } from "@/lib/branches";
import { cn } from "@/lib/utils";
import { BulletinActions } from "@/components/shared/BulletinActions";

/**
 * Branch-scoped side navigation (Prompt 3).
 * Reads the active route namespace and renders only that branch's sub-modules.
 * Portal uses its own mobile navigation, so this renders nothing there.
 */
export function SideNav() {
  const pathname = usePathname();
  const branch = branchForPath(pathname);

  if (!branch || branch.key === "portal") return null;

  // Branch dashboards (pathname equal to the branch href) end the sidebar with the bulletin buttons.
  const showBulletins = pathname === branch.href;

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:block">
      <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col overflow-y-auto p-3">
        <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{branch.label}</p>
        <ul className="space-y-0.5">
          {branch.nav.map((item) => (
            <NavGroup key={item.label} item={item} pathname={pathname} />
          ))}
        </ul>
        {showBulletins && (
          <div className="mt-auto border-t pt-3">
            <BulletinActions stacked />
          </div>
        )}
      </div>
    </aside>
  );
}

type Item = {
  label: string;
  href?: string;
  implemented: boolean;
  children?: { label: string; href?: string; implemented: boolean }[];
};

function isActive(pathname: string, href?: string) {
  return !!href && (pathname === href || pathname.startsWith(href + "/"));
}

function TBDBadge() {
  return <span className="ml-auto rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900">TBD</span>;
}

function NavGroup({ item, pathname }: { item: Item; pathname: string }) {
  const hasChildren = !!item.children?.length;
  const childActive = item.children?.some((c) => isActive(pathname, c.href)) ?? false;
  const active = isActive(pathname, item.href) || childActive;
  const [open, setOpen] = React.useState(active);

  // Section header: a label with no route. Collapsible; children are compact rows.
  if (!item.href && hasChildren) {
    return <SectionGroup label={item.label} childrenItems={item.children!} pathname={pathname} />;
  }

  if (!hasChildren) {
    return (
      <li>
        {item.href ? (
          <Link href={item.href} className={rowClass(active)} aria-current={active ? "page" : undefined}>
            {item.label}
            {!item.implemented && <TBDBadge />}
          </Link>
        ) : (
          <span className={cn(rowClass(false), "cursor-default opacity-60")}>
            {item.label}
            {!item.implemented && <TBDBadge />}
          </span>
        )}
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center">
        <Link href={item.href!} className={cn(rowClass(active), "flex-1")} aria-current={active ? "page" : undefined}>
          {item.label}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${item.label}`}
          className="rounded p-2 text-muted-foreground hover:bg-accent"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && (
        <ul className="ml-4 space-y-0.5 border-l pl-2">
          {item.children!.map((c) => (
            <ChildItem key={c.label} child={c} pathname={pathname} />
          ))}
        </ul>
      )}
    </li>
  );
}

type Child = { label: string; href?: string; implemented: boolean };

/** Foldable section (no route of its own). Starts expanded. */
function SectionGroup({ label, childrenItems, pathname }: { label: string; childrenItems: Child[]; pathname: string }) {
  const [open, setOpen] = React.useState(true);
  return (
    <li className="pt-2 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded px-3 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", !open && "-rotate-90")} aria-hidden />
      </button>
      {open && (
        <ul className="mt-0.5 space-y-0">
          {childrenItems.map((c) => (
            <ChildItem key={c.label} child={c} pathname={pathname} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Sub-item row. Without an href it is a placeholder for a function that has no route yet. */
function ChildItem({ child, pathname }: { child: Child; pathname: string }) {
  if (!child.href) {
    return (
      <li>
        <span className={cn(rowClass(false, true), "cursor-default opacity-60")}>
          {child.label}
          {!child.implemented && <TBDBadge />}
        </span>
      </li>
    );
  }
  const on = isActive(pathname, child.href);
  return (
    <li>
      <Link href={child.href} className={rowClass(on, true)} aria-current={on ? "page" : undefined}>
        {child.label}
        {!child.implemented && <TBDBadge />}
      </Link>
    </li>
  );
}

function rowClass(on: boolean, compact = false) {
  return cn(
    "flex w-full items-center gap-2 rounded-r-md border-l-2 px-3 text-sm transition-colors",
    compact ? "py-1.5" : "py-2",
    on ? "border-primary bg-accent font-medium text-accent-foreground" : "border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground",
  );
}
