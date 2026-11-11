"use server";

import { revalidatePath } from "next/cache";
import { ChecklistBranch, ResponsibleRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, STAFF_ROLES } from "@/lib/session";

const PATH = "/site-management/admin/checklist-templates";

const BRANCH_VALUES = Object.values(ChecklistBranch) as string[];
const ROLE_VALUES = Object.values(ResponsibleRole) as string[];

function parseBranch(v: FormDataEntryValue | null): ChecklistBranch {
  const s = String(v ?? "");
  if (!BRANCH_VALUES.includes(s)) throw new Error("Invalid branch.");
  return s as ChecklistBranch;
}

function parseRole(v: FormDataEntryValue | null): ResponsibleRole {
  const s = String(v ?? "");
  if (!ROLE_VALUES.includes(s)) throw new Error("Invalid responsible role.");
  return s as ResponsibleRole;
}

const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

/** Create New Checklist Template. An empty siteId creates a global default. */
export async function createTemplate(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Template name is required.");

  const siteId = String(formData.get("siteId") ?? "") || null;
  const template = await prisma.checklistTemplate.create({
    data: {
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      branch: parseBranch(formData.get("branch")),
      targetRole: parseRole(formData.get("targetRole")),
      siteId,
      isActive: bool(formData, "isActive"),
    },
  });
  revalidatePath(PATH);
  return template.id;
}

/** Template metadata: name, description, branch, target role and Active toggle. */
export async function updateTemplate(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  await prisma.checklistTemplate.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      branch: parseBranch(formData.get("branch")),
      targetRole: parseRole(formData.get("targetRole")),
      isActive: bool(formData, "isActive"),
    },
  });
  revalidatePath(PATH);
}

async function bumpVersion(templateId: string) {
  await prisma.checklistTemplate.update({ where: { id: templateId }, data: { version: { increment: 1 } } });
}

export async function addItem(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const templateId = String(formData.get("templateId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  if (!description) throw new Error("Item description is required.");

  const last = await prisma.checklistItem.findFirst({ where: { templateId }, orderBy: { orderIndex: "desc" } });
  await prisma.checklistItem.create({
    data: {
      templateId,
      orderIndex: (last?.orderIndex ?? 0) + 1,
      description,
      isRequired: bool(formData, "isRequired"),
      requiresDocument: bool(formData, "requiresDocument"),
      responsibleRole: parseRole(formData.get("responsibleRole")),
    },
  });
  await bumpVersion(templateId);
  revalidatePath(PATH);
}

export async function updateItem(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  const item = await prisma.checklistItem.findUniqueOrThrow({ where: { id } });
  await prisma.checklistItem.update({
    where: { id },
    data: {
      description: String(formData.get("description") ?? "").trim() || item.description,
      isRequired: bool(formData, "isRequired"),
      requiresDocument: bool(formData, "requiresDocument"),
      responsibleRole: parseRole(formData.get("responsibleRole")),
    },
  });
  await bumpVersion(item.templateId);
  revalidatePath(PATH);
}

export async function deleteItem(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  const item = await prisma.checklistItem.findUniqueOrThrow({ where: { id } });
  await prisma.checklistItem.delete({ where: { id } });
  await bumpVersion(item.templateId);
  revalidatePath(PATH);
}

/** Reorder Up / Down: swaps orderIndex with the neighbouring item. */
export async function moveItem(formData: FormData) {
  await requireRole(STAFF_ROLES);
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction")) === "up" ? -1 : 1;
  const item = await prisma.checklistItem.findUniqueOrThrow({ where: { id } });
  const neighbour = await prisma.checklistItem.findFirst({
    where: { templateId: item.templateId, orderIndex: item.orderIndex + direction },
  });
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.checklistItem.update({ where: { id: item.id }, data: { orderIndex: neighbour.orderIndex } }),
    prisma.checklistItem.update({ where: { id: neighbour.id }, data: { orderIndex: item.orderIndex } }),
  ]);
  await bumpVersion(item.templateId);
  revalidatePath(PATH);
}
