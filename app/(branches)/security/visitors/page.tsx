import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Visitors" };

export default function VisitorsPage() {
  return (
    <div>
      <PageHeader title="Visitors" />
      <TBDPlaceholder featureName="Visitors" />
    </div>
  );
}
