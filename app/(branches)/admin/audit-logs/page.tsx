import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Audit Logs" };

export default function AuditLogsPage() {
  return (
    <div>
      <PageHeader title="Audit Logs" />
      <TBDPlaceholder featureName="Audit Logs" />
    </div>
  );
}
