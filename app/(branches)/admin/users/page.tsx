import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/session";
import { enumLabel, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form-fields";
import { createStaffUser } from "../actions";

export const metadata = { title: "User Management" };

export default async function UsersPage() {
  await requireRole(ADMIN_ROLES);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, include: { resident: { select: { id: true } } } });

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Staff and admin logins. Resident logins are created from resident records." />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Linked Resident</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{enumLabel(u.role)}</td>
                <td className="px-4 py-3">{u.resident ? "Yes" : "—"}</td>
                <td className="px-4 py-3">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Staff or Admin User</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createStaffUser} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="u-name">Name</Label>
              <Input id="u-name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-email">Email</Label>
              <Input id="u-email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-role">Role</Label>
              <Select id="u-role" name="role" defaultValue="STAFF">
                <option value="STAFF">Staff</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-pass">Temporary password (min. 10 characters)</Label>
              <Input id="u-pass" name="password" type="password" minLength={10} required autoComplete="new-password" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
