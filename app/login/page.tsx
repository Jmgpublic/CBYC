import { Suspense } from "react";
import { LoginForm } from "@/components/shared/LoginForm";

export const metadata = { title: "Staff Sign In" };

export default function StaffLoginPage() {
  return (
    <Suspense>
      <LoginForm context="staff" title="Concierge Staff Sign In" description="For Super Admins and Staff." />
    </Suspense>
  );
}
