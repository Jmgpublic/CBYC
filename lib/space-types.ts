import { prisma } from "@/lib/prisma";

/** Space types maintained in the Site Management Admin > Maintain Space Types page. */
export async function getSpaceTypes({ activeOnly = false }: { activeOnly?: boolean } = {}) {
  return prisma.spaceType.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, isActive: true },
  });
}
