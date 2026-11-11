import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Preventive Maintenance" };

export default function PreventiveMaintenancePage() {
  return (
    <div>
      <PageHeader title="Preventive Maintenance" />
      <TBDPlaceholder featureName="Preventive Maintenance" />
    </div>
  );
}
