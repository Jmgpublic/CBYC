import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { BRANCHES } from "@/lib/branches";
import { NavCard, NavGrid, PageHeader } from "@/components/shared/NavCard";
import { BulletinActions } from "@/components/shared/BulletinActions";

export const metadata = { title: "Home" };

/** Home (/): six navigation cards for the main branches (Prompt 2). */
export default async function HomePage() {
  const session = await requireSession();
  if (session.user.role === "RESIDENT") redirect("/portal");

  const cards = [
    { key: "site-management", description: "Sites, residents, space rosters and billing." },
    { key: "facilities", description: "Work orders, assets, vendors and maintenance." },
    { key: "security", description: "Incidents, visitors and access control." },
    { key: "cases", description: "Case records, categories and assignments." },
    { key: "portal", description: "Resident announcements, balance and requests." },
    { key: "admin", description: "Users, roles, site configuration and audit logs." },
  ]
    .filter((c) => c.key !== "admin" || session.user.role === "SUPER_ADMIN")
    .map((c) => ({ ...c, branch: BRANCHES.find((b) => b.key === c.key)! }));

  return (
    <div>
      <PageHeader title="Home" description={`Welcome, ${session.user.name ?? "to Concierge"}.`} actions={<BulletinActions />} />
      <NavGrid>
        {cards.map((c) => (
          <NavCard key={c.key} title={c.branch.label} description={c.description} href={c.branch.href} />
        ))}
      </NavGrid>
    </div>
  );
}
