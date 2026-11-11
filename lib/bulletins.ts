import { prisma } from "@/lib/prisma";
import { activeBulletinsWhere } from "@/lib/bulletin-rules";

/** Messages currently on the board. Newest first. */
export function getActiveBulletins(now: Date = new Date()) {
  return prisma.bulletin.findMany({
    where: activeBulletinsWhere(now),
    orderBy: { dateTimeCreated: "desc" },
    select: { id: true, msgTo: true, msgFrom: true, msg: true, msgEnd: true },
  });
}

/** Every bulletin, for the Admin editor. */
export function getAllBulletins() {
  return prisma.bulletin.findMany({
    orderBy: { dateTimeCreated: "desc" },
    include: { creator: { select: { name: true } } },
  });
}
