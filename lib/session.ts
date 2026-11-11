import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/** Returns the current session or null. */
export async function getSession() {
  return getServerSession(authOptions);
}

/** Server pages: require any signed-in user. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Server components and actions: require one of the given roles. */
export async function requireRole(roles: string[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) redirect("/");
  return session;
}

/**
 * Resident row-level scope. Every /api/portal/* handler and portal query must
 * use the residentId returned here, never a value from the request.
 */
export async function requireResidentId() {
  const session = await getSession();
  if (!session || session.user.role !== "RESIDENT" || !session.user.residentId) {
    return null;
  }
  return session.user.residentId;
}

export const STAFF_ROLES = ["SUPER_ADMIN", "STAFF"];
export const ADMIN_ROLES = ["SUPER_ADMIN"];
export const RESIDENT_ROLES = ["RESIDENT"];
