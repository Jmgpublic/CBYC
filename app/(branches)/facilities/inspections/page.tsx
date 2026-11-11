import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Inspections" };

export default function InspectionsPage() {
  return (
    <div>
      <PageHeader title="Inspections" />
      <TBDPlaceholder featureName="Inspections" />
    </div>
  );
}
