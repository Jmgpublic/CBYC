import { currentResident } from "@/lib/portal";
import { NavCard, NavGrid, PageHeader } from "@/components/shared/NavCard";
import { BulletinActions } from "@/components/shared/BulletinActions";

export const metadata = { title: "Resident Portal" };

/** Portal home: navigation only (Prompt 2 rule). */
export default async function PortalHome() {
  const resident = await currentResident();
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${resident.firstName}`}
        description={`Unit ${resident.unit ?? "—"}`}
        actions={<BulletinActions />}
      />
      <NavGrid>
        <NavCard title="Announcements" description="Notices, audited updates and community news." href="/portal/announcements" />
        <NavCard title="Messages" description="Contact the property team." href="/portal/messages" />
        <NavCard title="Account Balance" description="Lease fees, balance and transactions." href="/portal/balance" />
        <NavCard title="Service Requests" description="Submit a request and check its status." href="/portal/requests" />
        <NavCard title="Payments" description="Pay rent and fees." href="/portal/payments" />
      </NavGrid>
    </div>
  );
}
