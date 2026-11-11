"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn, formatDateTime } from "@/lib/utils";

export type BulletinItem = {
  id: string;
  msgTo: string | null;
  msgFrom: string | null;
  msg: string;
  msgEnd: Date;
};

/**
 * Continuous vertical scroll of active bulletins. The list is rendered twice and the
 * track animates from 0 to -50%, so the loop is seamless. Hover pauses (see globals.css).
 * The page re-fetches every `refreshSeconds` so messages start and expire on time.
 */
export function BulletinScroll({
  items,
  kiosk = false,
  refreshSeconds = 60,
  className,
}: {
  items: BulletinItem[];
  kiosk?: boolean;
  refreshSeconds?: number;
  className?: string;
}) {
  const router = useRouter();

  React.useEffect(() => {
    const id = window.setInterval(() => router.refresh(), refreshSeconds * 1000);
    return () => window.clearInterval(id);
  }, [router, refreshSeconds]);

  if (items.length === 0) {
    return (
      <div className={cn("flex h-full items-center justify-center text-center", kiosk ? "text-2xl text-slate-400" : "text-muted-foreground", className)}>
        No active bulletins. Use New Bulletin to post one.
      </div>
    );
  }

  // Roughly 8 seconds per message, with a 20 second minimum, so long lists stay readable.
  const duration = Math.max(20, items.length * 8);

  const renderList = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className={cn("space-y-4", kiosk ? "pb-10" : "pb-4")}>
      {items.map((item) => (
        <li key={`${hidden ? "b" : "a"}-${item.id}`}>
          <BulletinCard item={item} kiosk={kiosk} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn("relative h-full overflow-hidden", className)}>
      <div className="bulletin-track" style={{ animationDuration: `${duration}s` }}>
        {renderList(false)}
        {renderList(true)}
      </div>
    </div>
  );
}

function BulletinCard({ item, kiosk }: { item: BulletinItem; kiosk: boolean }) {
  const audience = [item.msgTo && `To: ${item.msgTo}`, item.msgFrom && `From: ${item.msgFrom}`].filter(Boolean).join("   ·   ");

  return (
    <article
      className={cn(
        "rounded-lg border",
        kiosk ? "border-slate-700 bg-slate-900 p-8 text-white" : "bg-card p-4 text-card-foreground shadow-sm",
      )}
    >
      {audience && <p className={cn("font-medium", kiosk ? "text-xl text-sky-300" : "text-sm text-primary")}>{audience}</p>}
      <p className={cn("whitespace-pre-line", kiosk ? "mt-4 text-4xl leading-snug" : "mt-2 text-base")}>{item.msg}</p>
      <p className={cn("mt-3", kiosk ? "text-lg text-slate-400" : "text-xs text-muted-foreground")}>
        Shown until {formatDateTime(item.msgEnd)}
      </p>
    </article>
  );
}
