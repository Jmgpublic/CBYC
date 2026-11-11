"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/session";

/** User Management: create a staff or admin login. Residents are linked from the resident record. */
export async function createStaffUser(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!name || !email) throw new Error("Name and email are required.");
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");
  if (role !== Role.STAFF && role !== Role.SUPER_ADMIN) throw new Error("Role must be STAFF or SUPER_ADMIN.");

  await prisma.user.create({
    data: { name, email, role, passwordHash: await bcrypt.hash(password, 12) },
  });
  revalidatePath("/admin/users");
}

/** Site Configuration: add a site. */
export async function createSite(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    zip: String(formData.get("zip") ?? "").trim(),
  };
  if (Object.values(data).some((v) => !v)) throw new Error("All site fields are required.");

  await prisma.site.create({ data });
  revalidatePath("/admin/sites");
}
