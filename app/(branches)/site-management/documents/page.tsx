import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <div>
      <PageHeader title="Documents" />
      <TBDPlaceholder featureName="Documents" />
    </div>
  );
}
