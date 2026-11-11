import { requireSession } from "@/lib/session";

/** Kiosk shell: full screen, no navigation. Any signed-in kiosk login may view it. */
export default async function KioskLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <div className="min-h-screen bg-slate-950 text-white">{children}</div>;
}
