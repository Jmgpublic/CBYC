import { currentResident, getBalance } from "@/lib/portal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Account Balance" };

export default async function BalancePage() {
  const resident = await currentResident();
  const b = await getBalance(resident.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Account Status & Balance" description={`Unit ${resident.unit ?? "—"}`} />

      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Current balance</p>
          <p className="text-3xl font-semibold">{formatCurrency(b.balance)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Billed {formatCurrency(b.charges)} · Paid {formatCurrency(b.paid)}
            {b.nextDue ? ` · Next due ${formatDate(b.nextDue)}` : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lease fee breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {b.breakdown.length === 0 && <p className="text-muted-foreground">No billed fees yet.</p>}
          {b.breakdown.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <span>{row.label}</span>
              <span>{formatCurrency(row.amount)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y text-sm">
            {b.transactions.length === 0 && <li className="p-5 text-muted-foreground">No transactions yet.</li>}
            {b.transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p>{t.label}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                </div>
                <span className={t.amount < 0 ? "text-destructive" : "text-emerald-700"}>{formatCurrency(t.amount)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
