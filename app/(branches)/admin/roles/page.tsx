import { requireRole, ADMIN_ROLES } from "@/lib/session";
import { PageHeader } from "@/components/shared/NavCard";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Role Management" };

const ROLE_ACCESS = [
  { role: "SUPER_ADMIN", label: "Super Admin", access: "Admin branch, all staff branches, staff login at /login" },
  { role: "STAFF", label: "Staff", access: "Site Management, Facilities, Security, Case Management; staff login at /login" },
  { role: "RESIDENT", label: "Resident", access: "Resident Portal only (/portal and /api/portal/*); login at /portal/login" },
];

/** Role Management: read-only reference of the three roles and their access (Prompt 1 enum, Prompt 4 rules). */
export default async function RolesPage() {
  await requireRole(ADMIN_ROLES);
  return (
    <div>
      <PageHeader title="Role Management" description="Concierge uses three roles. Access is enforced in middleware and on the server." />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Access</th>
            </tr>
          </thead>
          <tbody>
            {ROLE_ACCESS.map((r) => (
              <tr key={r.role} className="border-t">
                <td className="px-4 py-3 font-medium">{r.label}</td>
                <td className="px-4 py-3">{r.access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
