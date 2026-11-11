import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <div>
      <PageHeader title="History" />
      <TBDPlaceholder featureName="History" />
    </div>
  );
}
