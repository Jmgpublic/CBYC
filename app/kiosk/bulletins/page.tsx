import { getActiveBulletins } from "@/lib/bulletins";
import { BulletinScroll } from "@/components/shared/BulletinScroll";

export const metadata = { title: "Bulletin Board" };
export const dynamic = "force-dynamic";

/** Kiosk display: active bulletins in a continuous scroll, full screen. */
export default async function KioskBulletinPage() {
  const items = await getActiveBulletins();

  return (
    <div className="flex h-screen flex-col p-10">
      <header className="pb-8 text-center">
        <h1 className="text-6xl font-semibold tracking-tight">Bulletin Board</h1>
      </header>
      <div className="min-h-0 flex-1">
        <BulletinScroll items={items} kiosk />
      </div>
    </div>
  );
}
