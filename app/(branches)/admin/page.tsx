import { NavCard, NavGrid, PageHeader } from "@/components/shared/NavCard";

export const metadata = { title: "Admin" };

/** Admin dashboard: navigation only (Prompt 2 rule). */
export default function AdminDashboard() {
  return (
    <div>
      <PageHeader title="Admin" description="Users, roles, site configuration and audit logs." />
      <NavGrid>
        <NavCard title="User Management" description="Create and review staff logins." href="/admin/users" />
        <NavCard title="Role Management" description="Roles and what each one can access." href="/admin/roles" />
        <NavCard title="Site Configuration" description="Sites and their details." href="/admin/sites" />
        <NavCard title="Edit Bulletin Board" description="Approve, reject, edit or delete bulletins." href="/admin/bulletin-board" />
        <NavCard title="Audit Logs [TBD]" description="Activity history." href="/admin/audit-logs" />
      </NavGrid>
    </div>
  );
}
