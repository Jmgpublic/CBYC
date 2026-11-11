import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/** Cookie holding the site chosen on the Site Management dashboard. Empty/absent = all sites. */
export const ACTIVE_SITE_COOKIE = "sm_active_site";

/** Server-side: returns the active site for this browser, or null when showing all sites. */
export async function getActiveSite() {
  const id = (await cookies()).get(ACTIVE_SITE_COOKIE)?.value;
  if (!id) return null;
  // A stale or tampered cookie resolves to null, i.e. "all sites".
  return prisma.site.findUnique({ where: { id }, select: { id: true, name: true } });
}
