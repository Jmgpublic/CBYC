import { NavCard, NavGrid, PageHeader } from "@/components/shared/NavCard";

export const metadata = { title: "Security" };

/** Security dashboard: navigation only (Prompt 2 rule). */
export default function SecurityDashboard() {
  return (
    <div>
      <PageHeader title="Security" description="Navigate to incidents, visitors, access control and reports." />
      <NavGrid>
        <NavCard title="Incidents" description="Log, review and resolve incidents." href="/security/incidents" />
        <NavCard title="Visitors [TBD]" description="Visitor log and passes." href="/security/visitors" />
        <NavCard title="Access Control [TBD]" description="Keys, fobs and access rules." href="/security/access-control" />
        <NavCard title="Reports [TBD]" description="Statutory and security reports." href="/security/reports" />
      </NavGrid>
    </div>
  );
}
