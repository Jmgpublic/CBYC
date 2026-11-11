import { requireSession } from "@/lib/session";
import { TopNav } from "@/components/shared/TopNav";
import { SideNav } from "@/components/shared/SideNav";

/**
 * Shell shared by every branch (Prompt 2). Branch folders stay isolated:
 * they only import from /components/shared, /components/ui and /lib.
 */
export default async function BranchLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-screen">
      <TopNav name={session.user.name ?? "Signed in"} email={session.user.email} role={session.user.role} />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <SideNav />
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
