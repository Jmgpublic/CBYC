"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-fields";
import { formatCurrency } from "@/lib/utils";

export function PayForm({ maxAmount }: { maxAmount: number }) {
  const router = useRouter();
  const [amount, setAmount] = React.useState(maxAmount.toFixed(2));
  const [message, setMessage] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, setPending] = React.useState(false);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setPending(true);
    const res = await fetch("/api/portal/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    setPending(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ kind: "err", text: data.error ?? "Payment could not be recorded." });
      return;
    }
    setMessage({ kind: "ok", text: `Recorded payment ${data.reference} for ${formatCurrency(data.amount)}.` });
    router.refresh();
  }

  return (
    <form onSubmit={pay} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pay-amount">Amount (USD)</Label>
        <Input
          id="pay-amount"
          type="number"
          step="0.01"
          min="0.01"
          max={maxAmount}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      {message && (
        <p role={message.kind === "err" ? "alert" : "status"} className={message.kind === "err" ? "text-sm text-destructive" : "text-sm text-emerald-700"}>
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Processing…" : "Pay Now"}
      </Button>
    </form>
  );
}
