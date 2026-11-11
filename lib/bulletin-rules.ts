/**
 * Bulletin board rules shared by server code and client components.
 * Pure functions only: no Prisma or Node-only imports here.
 */

export const BULLETIN_LIMITS = { to: 50, from: 50, msg: 500 } as const;

/** Default display window when no end time is entered. */
export const BULLETIN_DEFAULT_HOURS = 72;

/**
 * Board and kiosk filter: CurrentDateTime > msgStart AND CurrentDateTime < msgEnd AND not rejected.
 * `rejected` is nullable; null and false both mean "not rejected".
 */
export function activeBulletinsWhere(now: Date) {
  return {
    msgStart: { lt: now },
    msgEnd: { gt: now },
    OR: [{ rejected: null }, { rejected: false }],
  };
}

export type BulletinStatus = "Active" | "Scheduled" | "Expired" | "Rejected";

export function bulletinStatus(
  b: { msgStart: Date; msgEnd: Date; rejected: boolean | null },
  now: Date = new Date(),
): BulletinStatus {
  if (b.rejected === true) return "Rejected";
  if (b.msgStart.getTime() > now.getTime()) return "Scheduled";
  if (b.msgEnd.getTime() <= now.getTime()) return "Expired";
  return "Active";
}

export type BulletinResult = { ok: true } | { ok: false; error: string };

export type BulletinInput = {
  msgTo: string | null;
  msgFrom: string | null;
  msg: string;
  msgStart: Date;
  msgEnd: Date;
};

type Field<T> = { ok: true; value: T } | { ok: false; error: string };

function readText(formData: FormData, key: string, max: number, label: string, required: boolean): Field<string | null> {
  const value = String(formData.get(key) ?? "").trim();
  if (required && !value) return { ok: false, error: `${label} is required.` };
  if (value.length > max) return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  return { ok: true, value: value || null };
}

function readDate(formData: FormData, key: string, label: string): Field<Date | null> {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return { ok: true, value: null };
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { ok: false, error: `${label} is not a valid date and time.` };
  return { ok: true, value: d };
}

/**
 * Turns the New Bulletin form into a record.
 * Blank start = now. Blank end = start + 72 hours. Returns a user-facing error instead of throwing.
 */
export function parseBulletinForm(
  formData: FormData,
  now: Date = new Date(),
): { ok: true; data: BulletinInput } | { ok: false; error: string } {
  const to = readText(formData, "msgTo", BULLETIN_LIMITS.to, "To", false);
  if (!to.ok) return to;
  const from = readText(formData, "msgFrom", BULLETIN_LIMITS.from, "From", false);
  if (!from.ok) return from;
  const msg = readText(formData, "msg", BULLETIN_LIMITS.msg, "Message", true);
  if (!msg.ok) return msg;

  const startInput = readDate(formData, "msgStart", "Start");
  if (!startInput.ok) return startInput;
  const endInput = readDate(formData, "msgEnd", "End");
  if (!endInput.ok) return endInput;

  const msgStart = startInput.value ?? now;
  const msgEnd = endInput.value ?? new Date(msgStart.getTime() + BULLETIN_DEFAULT_HOURS * 60 * 60 * 1000);
  if (msgEnd.getTime() <= msgStart.getTime()) return { ok: false, error: "End must be after the start." };

  return {
    ok: true,
    data: { msgTo: to.value, msgFrom: from.value, msg: msg.value as string, msgStart, msgEnd },
  };
}
