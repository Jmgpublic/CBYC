// Quick database connectivity check: `npm run db:check`
import { prisma } from "../lib/prisma";

async function main() {
  const started = Date.now();
  try {
    const [row] = await prisma.$queryRaw<{ ok: number; version: string }[]>`SELECT 1 AS ok, version()`;
    const count = await prisma.site.count();
    console.log(`OK: connected in ${Date.now() - started} ms (SELECT 1 returned ${row.ok}; ${count} site(s) found)`);
    console.log(`Server: ${row.version.split(",")[0]}`);
  } catch (err) {
    console.error("FAILED: could not query the database.");
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
