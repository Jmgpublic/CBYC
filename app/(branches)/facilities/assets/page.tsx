import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Assets" };

export default function AssetsPage() {
  return (
    <div>
      <PageHeader title="Assets" />
      <TBDPlaceholder featureName="Assets" />
    </div>
  );
}
