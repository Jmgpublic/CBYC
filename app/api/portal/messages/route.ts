import { NextResponse } from "next/server";
import { getSession, requireResidentId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getMessages } from "@/lib/portal";

export const dynamic = "force-dynamic";

/** GET /api/portal/messages: the resident's own message thread. */
export async function GET() {
  const residentId = await requireResidentId();
  if (!residentId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await getMessages(residentId));
}

/** POST /api/portal/messages: send a message to staff. Sender and resident both come from the session. */
export async function POST(req: Request) {
  const session = await getSession();
  const residentId = session?.user.residentId ?? null;
  if (!session || session.user.role !== "RESIDENT" || !residentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { body?: unknown } | null;
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text || text.length > 2000) {
    return NextResponse.json({ error: "Message must be 1 to 2000 characters." }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { residentId, senderId: session.user.id, body: text },
  });
  return NextResponse.json(message, { status: 201 });
}
