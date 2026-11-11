import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/shared/NavCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await requireSession();
  return (
    <div>
      <PageHeader title="Profile" />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{session.user.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Email: </span>
            {session.user.email}
          </p>
          <p>
            <span className="text-muted-foreground">Role: </span>
            {session.user.role.replace("_", " ")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
