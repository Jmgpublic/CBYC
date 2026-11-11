import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <div>
      <PageHeader title="Categories" />
      <TBDPlaceholder featureName="Categories" />
    </div>
  );
}
