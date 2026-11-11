import { NavCard, NavGrid, PageHeader } from "@/components/shared/NavCard";

export const metadata = { title: "Facilities" };

/** Facilities dashboard: navigation only (Prompt 2 rule). */
export default function FacilitiesDashboard() {
  return (
    <div>
      <PageHeader title="Facilities" description="Navigate to work orders, assets, vendors and maintenance." />
      <NavGrid>
        <NavCard title="Work Orders" description="Triage requests and track work orders." href="/facilities/work-orders" />
        <NavCard title="Assets [TBD]" description="Equipment and asset register." href="/facilities/assets" />
        <NavCard title="Vendors [TBD]" description="Subcontractors and vendors." href="/facilities/vendors" />
        <NavCard title="Preventive Maintenance [TBD]" description="Recurring maintenance schedules." href="/facilities/preventive-maintenance" />
        <NavCard title="Inspections [TBD]" description="Inspection checklists and results." href="/facilities/inspections" />
      </NavGrid>
    </div>
  );
}
