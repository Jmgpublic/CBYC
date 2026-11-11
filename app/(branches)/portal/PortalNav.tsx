"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CreditCard, Home, MessageSquare, Receipt, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/portal", label: "Home", icon: Home },
  { href: "/portal/announcements", label: "News", icon: Bell },
  { href: "/portal/messages", label: "Messages", icon: MessageSquare },
  { href: "/portal/balance", label: "Balance", icon: Receipt },
  { href: "/portal/requests", label: "Requests", icon: Wrench },
  { href: "/portal/payments", label: "Pay", icon: CreditCard },
];

/** Bottom tab bar for phones. Sits above the content on small screens only. */
export function PortalNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Resident portal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur md:static md:border-0 md:bg-transparent"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-6 md:flex md:flex-wrap md:gap-2 md:py-4">
        {ITEMS.map((item) => {
          const active = item.href === "/portal" ? pathname === "/portal" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2 text-[11px] md:flex-row md:rounded-md md:border md:px-3 md:py-1.5 md:text-sm",
                  active ? "text-primary md:border-primary md:bg-accent" : "text-muted-foreground hover:text-foreground md:border-transparent",
                )}
              >
                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
