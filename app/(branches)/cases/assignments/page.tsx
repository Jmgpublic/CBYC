import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Assignments" };

export default function AssignmentsPage() {
  return (
    <div>
      <PageHeader title="Assignments" />
      <TBDPlaceholder featureName="Assignments" />
    </div>
  );
}
