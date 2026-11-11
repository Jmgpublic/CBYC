import { PageHeader } from "@/components/shared/NavCard";
import { TBDPlaceholder } from "@/components/shared/TBDPlaceholder";

export const metadata = { title: "Occupancy" };

export default function OccupancyPage() {
  return (
    <div>
      <PageHeader title="Occupancy" />
      <TBDPlaceholder featureName="Occupancy" />
    </div>
  );
}
