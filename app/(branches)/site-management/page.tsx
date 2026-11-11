import { prisma } from "@/lib/prisma";
import { getActiveSite } from "@/lib/active-site";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavCard, NavGrid, PageHeader } from "@/components/shared/NavCard";
import { SiteSelector } from "./SiteSelector";

export const metadata = { title: "Site Management" };

/** Card for a function that has no page yet. Not a link. */
function TbdCard({ title, description }: { title: string; description?: string }) {
  return (
    <Card className="h-full opacity-70">
      <CardHeader className="space-y-1.5">
        <CardTitle className="flex items-center gap-2">
          {title}
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900">TBD</span>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <NavGrid>{children}</NavGrid>
    </section>
  );
}

/**
 * Site Management dashboard. The site dropdown is a scope filter, not a metric:
 * the chosen site applies to Residents, Space Roster and Leases.
 */
export default async function SiteManagementDashboard() {
  await requireRole(STAFF_ROLES);
  const [sites, activeSite] = await Promise.all([
    prisma.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getActiveSite(),
  ]);
  const scope = activeSite?.name ?? "all sites";

  return (
    <div className="space-y-10">
      <PageHeader title="Site Management" description="Navigate to site, tenant, lease and billing functions." />

      <Card>
        <CardHeader>
          <CardTitle>Site</CardTitle>
          <CardDescription>Choose a site to filter the roster, leases and tenants. Your choice stays until you change it.</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <SiteSelector sites={sites} activeSiteId={activeSite?.id ?? ""} />
        </div>
      </Card>

      <Section title="Tenant Lifecycle">
        <TbdCard title="Tenant Qualification" />
        <TbdCard title="Waitlist Management" />
        <TbdCard title="Onboarding" />
        <TbdCard title="Offboarding" />
        <NavCard title="Residents" description={`Tenant directory for ${scope}.`} href="/site-management/residents" />
      </Section>

      <Section title="Leases & Tenancy">
        <TbdCard title="Manage Funders" />
        <NavCard title="Lease Agreements [TBD]" description={`Lease agreements for ${scope}.`} href="/site-management/leases" />
        <NavCard title="Occupancy and Renewals [TBD]" description="Occupancy and renewals." href="/site-management/occupancy" />
        <NavCard title="Space Roster" description={`Spaces for ${scope}.`} href="/site-management/space-roster" />
      </Section>

      <Section title="Revenue & Bill Processing">
        <NavCard title="Lease Charges" description="Review forecast and held charges, then bill them." href="/site-management/billing" />
        <TbdCard title="One Time Charges" />
      </Section>

      <Section title="Site Management Admin">
        <NavCard title="Maintain Space Types" description="Space types used for spaces and charges." href="/site-management/admin/space-types" />
        <NavCard title="Maintain Checklist Templates" description="Global and site-specific checklists." href="/site-management/admin/checklist-templates" />
        <NavCard title="Sites" description="View sites and their details." href="/site-management/sites" />
      </Section>
    </div>
  );
}
