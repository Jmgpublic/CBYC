import { currentResident, getMessages } from "@/lib/portal";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/shared/NavCard";
import { MessageForm } from "./MessageForm";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const resident = await currentResident();
  const messages = await getMessages(resident.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Send a message to the property team." />
      <div className="space-y-3">
        {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
        {messages.map((m) => {
          const fromResident = m.sender.role === "RESIDENT";
          return (
            <div key={m.id} className={`max-w-[85%] rounded-lg border p-3 text-sm ${fromResident ? "ml-auto bg-accent/50" : "bg-card"}`}>
              <p>{m.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {fromResident ? "You" : m.sender.name} · {formatDateTime(m.createdAt)}
              </p>
            </div>
          );
        })}
      </div>
      <MessageForm />
    </div>
  );
}
