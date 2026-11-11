/** Shared option lists used by more than one branch. */

export const SPACE_STATUSES = ["VACANT", "OCCUPIED", "MAINTENANCE", "INACTIVE"] as const;

export const WORK_ORDER_STATUSES = ["OPEN", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const ASSIGNEE_KINDS = [
  { value: "INTERNAL_STAFF", label: "Internal – Staff" },
  { value: "INTERNAL_RESIDENT", label: "Internal – Resident" },
  { value: "EXTERNAL_VENDOR", label: "External – Subcontractor / Vendor" },
] as const;

export const SERVICE_CATEGORIES = ["INFORMATION", "PERMISSION", "MAINTENANCE"] as const;

export const INCIDENT_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const INCIDENT_STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"] as const;

export const CASE_STATUSES = ["OPEN", "IN_PROGRESS", "PENDING_INFO", "RESOLVED", "CLOSED"] as const;

export const ANNOUNCEMENT_TYPES = ["GENERAL", "AUDITED", "NOTE_TO_RESIDENT"] as const;

export const CHECKLIST_BRANCHES = [
  { value: "SITE_MANAGEMENT", label: "Site Management" },
  { value: "FACILITIES", label: "Facilities" },
  { value: "SECURITY", label: "Security" },
  { value: "CASE_MANAGEMENT", label: "Case Management" },
  { value: "RESIDENT_PORTAL", label: "Resident Portal" },
  { value: "ADMIN", label: "Admin" },
] as const;

export const RESPONSIBLE_ROLES = [
  { value: "STAFF", label: "Staff" },
  { value: "RESIDENT", label: "Resident" },
  { value: "CASE_MANAGER", label: "Case Manager" },
] as const;
