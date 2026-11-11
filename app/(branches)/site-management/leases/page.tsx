import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";
import { getActiveSite } from "@/lib/active-site";
import { ActiveSiteNotice } from "../ActiveSiteNotice";

export const metadata = { title: "Leases" };

export default async function LeasesPage() {
  const activeSite = await getActiveSite();
  return (
    <div>
      <PageHeader title="Leases" />
      <div className="mb-4">
        <ActiveSiteNotice siteName={activeSite?.name ?? null} />
      </div>
      <TBDPlaceholder featureName="Leases" />
    </div>
  );
}
