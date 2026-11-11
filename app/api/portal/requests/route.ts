import { NextResponse } from "next/server";
import { ServiceCategory } from "@prisma/client";
import { requireResidentId } from "@/lib/session";
import { createServiceRequest } from "@/lib/service-requests";
import { getServiceRequests } from "@/lib/portal";

export const dynamic = "force-dynamic";

/** GET /api/portal/requests: the signed-in resident's own requests only. */
export async function GET() {
  const residentId = await requireResidentId();
  if (!residentId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await getServiceRequests(residentId));
}

/** POST /api/portal/requests: submit a service request. The resident is taken from the session. */
export async function POST(req: Request) {
  const residentId = await requireResidentId();
  if (!residentId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const category = String(body?.category ?? "");
  if (!(Object.values(ServiceCategory) as string[]).includes(category)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  try {
    const created = await createServiceRequest({
      residentId,
      category: category as ServiceCategory,
      type: String(body?.type ?? ""),
      description: String(body?.description ?? ""),
    });
    return NextResponse.json({ number: created.number, status: created.status, createdAt: created.createdAt }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not submit." }, { status: 400 });
  }
}
