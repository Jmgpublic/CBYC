import { currentResident } from "@/lib/portal";
import { PortalNav } from "./PortalNav";

/** Mobile-first portal shell. Keeps content clear of the bottom tab bar on phones. */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await currentResident();
  return (
    <div className="mx-auto w-full max-w-xl pb-24 md:max-w-4xl md:pb-0">
      {children}
      <PortalNav />
    </div>
  );
}
