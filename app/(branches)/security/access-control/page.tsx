import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Access Control" };

export default function AccessControlPage() {
  return (
    <div>
      <PageHeader title="Access Control" />
      <TBDPlaceholder featureName="Access Control" />
    </div>
  );
}
