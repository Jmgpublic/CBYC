import { currentResident, getAnnouncementsForSite } from "@/lib/portal";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Bulletin Board" };

type Ann = Awaited<ReturnType<typeof getAnnouncementsForSite>>[number];

export default async function AnnouncementsPage() {
  const resident = await currentResident();
  const all = await getAnnouncementsForSite(resident.siteId);

  // Notice banners: the most recent audited announcements.
  const banners = all.filter((a) => a.type === "AUDITED").slice(0, 2);
  const general = all.filter((a) => a.type === "GENERAL");
  const notes = all.filter((a) => a.type === "NOTE_TO_RESIDENT");

  return (
    <div className="space-y-6">
      <PageHeader title="Bulletin Board" description="Notices and updates for your community." />

      {banners.map((b) => (
        <div key={b.id} role="status" className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-950">
          <p className="text-xs font-semibold uppercase tracking-wide">Notice</p>
          <p className="font-medium">{b.title}</p>
          <p className="text-sm">{b.content}</p>
        </div>
      ))}

      <Section title="Audited Announcements" items={all.filter((a) => a.type === "AUDITED")} />
      <Section title="Notes to Residents" items={notes} />
      <Section title="General Announcements" items={general} />
    </div>
  );
}

function Section({ title, items }: { title: string; items: Ann[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing posted yet.</p>}
      {items.map((a) => (
        <Card key={a.id} className="p-4">
          <p className="font-medium">{a.title}</p>
          <p className="mt-1 text-sm">{a.content}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {a.author.name} · {formatDate(a.createdAt)}
          </p>
        </Card>
      ))}
    </section>
  );
}
