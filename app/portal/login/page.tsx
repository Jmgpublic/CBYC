import { Suspense } from "react";
import { LoginForm } from "@/components/shared/LoginForm";

export const metadata = { title: "Resident Sign In" };

export default function ResidentLoginPage() {
  return (
    <Suspense>
      <LoginForm context="resident" title="Resident Portal" description="Sign in to view your account and community updates." />
    </Suspense>
  );
}
