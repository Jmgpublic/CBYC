"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";
import { ACTIVE_SITE_COOKIE } from "@/lib/active-site";

/** Sets (or clears, with "") the site that Site Management pages filter to. */
export async function setActiveSite(siteId: string) {
  await requireRole(STAFF_ROLES);
  const jar = await cookies();

  if (!siteId) {
    jar.delete(ACTIVE_SITE_COOKIE);
  } else {
    const exists = await prisma.site.findUnique({ where: { id: siteId }, select: { id: true } });
    if (!exists) throw new Error("Unknown site.");
    jar.set(ACTIVE_SITE_COOKIE, siteId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  revalidatePath("/site-management", "layout");
}
