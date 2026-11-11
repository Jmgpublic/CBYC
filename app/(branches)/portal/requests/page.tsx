import { currentResident, getServiceRequests } from "@/lib/portal";
import { enumLabel, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequestForm } from "./RequestForm";

export const metadata = { title: "Service Requests" };

export default async function RequestsPage() {
  const resident = await currentResident();
  const requests = await getServiceRequests(resident.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Service Requests" description="Submit a maintenance request or question, and track its status." />

      <Card>
        <CardHeader>
          <CardTitle>New request</CardTitle>
        </CardHeader>
        <CardContent>
          <RequestForm />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your requests</h2>
        {requests.length === 0 && <p className="text-sm text-muted-foreground">You have not submitted any requests.</p>}
        {requests.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{r.number}</p>
                <p className="font-medium">
                  {enumLabel(r.category)} · {r.type}
                </p>
                <p className="mt-1 text-sm">{r.description}</p>
              </div>
              <Badge variant={r.status === "CLOSED" ? "success" : r.status === "ASSIGNED" ? "warning" : "muted"}>{enumLabel(r.status)}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Submitted {formatDate(r.createdAt)}
              {r.workOrder ? ` · Work order: ${r.workOrder.title} (${enumLabel(r.workOrder.status)})` : ""}
            </p>
          </Card>
        ))}
      </section>
    </div>
  );
}
