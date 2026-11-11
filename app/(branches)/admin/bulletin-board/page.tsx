import { requireRole, ADMIN_ROLES } from "@/lib/session";
import { getAllBulletins } from "@/lib/bulletins";
import { bulletinStatus } from "@/lib/bulletin-rules";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Card } from "@/components/ui/card";
import { BulletinAdminRow } from "./BulletinAdminRow";
import { NewBulletinModal } from "@/components/shared/NewBulletinModal";

export const metadata = { title: "Edit Bulletin Board" };
export const dynamic = "force-dynamic";

/** Admin: direct editing of the Bulletin table. Approve, reject, edit or delete any message. */
export default async function AdminBulletinBoardPage() {
  await requireRole(ADMIN_ROLES);
  const now = new Date();
  const rows = await getAllBulletins();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Bulletin Board"
        description="Every bulletin, including scheduled, expired and rejected ones. Rejected bulletins never appear on the board."
        actions={<NewBulletinModal />}
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">To</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Start</th>
              <th className="px-4 py-3 font-medium">End</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <BulletinAdminRow
                key={r.id}
                b={{
                  id: r.id,
                  msgTo: r.msgTo,
                  msgFrom: r.msgFrom,
                  msg: r.msg,
                  msgStart: r.msgStart,
                  msgEnd: r.msgEnd,
                  startLabel: formatDateTime(r.msgStart),
                  endLabel: formatDateTime(r.msgEnd),
                  approved: r.approved,
                  rejected: r.rejected,
                  status: bulletinStatus(r, now),
                }}
              />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  No bulletins yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
