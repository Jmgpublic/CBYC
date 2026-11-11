import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getActiveBulletins } from "@/lib/bulletins";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/NavCard";
import { BulletinScroll } from "@/components/shared/BulletinScroll";
import { NewBulletinModal } from "@/components/shared/NewBulletinModal";

export const metadata = { title: "Bulletin Board" };
export const dynamic = "force-dynamic";

/** Bulletin Board: active messages in a continuous scroll, shown inside the app shell. */
export default async function BulletinBoardPage() {
  await requireSession();
  const items = await getActiveBulletins();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulletin Board"
        description="Active messages scroll continuously. Hover to pause."
        actions={
          <div className="flex flex-wrap gap-2">
            <NewBulletinModal />
            <Link href="/kiosk/bulletins" className={buttonVariants({ variant: "outline" })}>
              Open Kiosk View
            </Link>
          </div>
        }
      />
      <Card className="h-[70vh] overflow-hidden p-4">
        <BulletinScroll items={items} />
      </Card>
    </div>
  );
}
