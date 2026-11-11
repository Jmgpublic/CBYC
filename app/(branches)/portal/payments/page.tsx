import { currentResident, getAmountDue } from "@/lib/portal";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Card, CardContent } from "@/components/ui/card";
import { PayForm } from "./PayForm";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const resident = await currentResident();
  const due = await getAmountDue(resident.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Portal" description="Pay rent and fees on your balance." />
      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-sm text-muted-foreground">Amount due</p>
            <p className="text-3xl font-semibold">{formatCurrency(due)}</p>
          </div>
          {due > 0 ? <PayForm maxAmount={due} /> : <p className="text-sm text-muted-foreground">Your balance is paid in full.</p>}
          <p className="text-xs text-muted-foreground">
            Development build: no payment processor is connected. Payments are recorded to your account for testing only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
