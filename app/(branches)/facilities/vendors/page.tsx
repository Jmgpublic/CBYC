import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Vendors" };

export default function VendorsPage() {
  return (
    <div>
      <PageHeader title="Vendors" />
      <TBDPlaceholder featureName="Vendors" />
    </div>
  );
}
