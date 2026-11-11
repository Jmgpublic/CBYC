import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { NewBulletinModal } from "@/components/shared/NewBulletinModal";

/**
 * Header actions for dashboards and the resident portal: Show Bulletin Board and New Bulletin.
 * `stacked` lays them out as full-width buttons in a column, for the side navigation.
 */
export function BulletinActions({ children, stacked = false }: { children?: React.ReactNode; stacked?: boolean }) {
  const full = stacked ? "w-full" : undefined;
  return (
    <div className={stacked ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}>
      <Link href="/bulletins" className={buttonVariants({ variant: "outline", className: full })}>
        Show Bulletin Board
      </Link>
      <NewBulletinModal className={full} />
      {children}
    </div>
  );
}
