import { NavCard, NavGrid, PageHeader } from "@/components/shared/NavCard";

export const metadata = { title: "Case Management" };

/** Case Management dashboard: navigation only (Prompt 2 rule). */
export default function CasesDashboard() {
  return (
    <div>
      <PageHeader title="Case Management" description="Navigate to cases, categories, assignments and history." />
      <NavGrid>
        <NavCard title="Cases" description="Open, assign and resolve cases." href="/cases/records" />
        <NavCard title="Categories [TBD]" description="Case categories." href="/cases/categories" />
        <NavCard title="Assignments [TBD]" description="Case assignments and workloads." href="/cases/assignments" />
        <NavCard title="History [TBD]" description="Closed case history." href="/cases/history" />
      </NavGrid>
    </div>
  );
}
