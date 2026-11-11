/**
 * Branch registry (Prompts 2, 3, 4 and 6). Each entry maps a top-level route
 * namespace to its roles and its sub-module navigation.
 *
 * Sub-module items with `implemented: false` render the standard TBD
 * placeholder and display a [TBD] badge in the side navigation.
 */

/**
 * A nav entry. Without `href` it is a non-link label: a section header when it has
 * `children`, or a placeholder for a function that has no route yet.
 */
export type NavItem = {
  label: string;
  href?: string;
  implemented: boolean;
  children?: { label: string; href?: string; implemented: boolean }[];
};

export type Branch = {
  key: "site-management" | "facilities" | "security" | "cases" | "admin" | "portal";
  label: string;
  href: string;
  allowedRoles: string[];
  nav: NavItem[];
};

export const BRANCHES: Branch[] = [
  {
    key: "site-management",
    label: "Site Management",
    href: "/site-management",
    allowedRoles: ["STAFF", "SUPER_ADMIN"],
    nav: [
      {
        label: "Tenant Lifecycle",
        implemented: true,
        children: [
          { label: "Tenant Qualification", implemented: false },
          { label: "Waitlist Management", implemented: false },
          { label: "Onboarding", implemented: false },
          { label: "Offboarding", implemented: false },
          { label: "Residents", href: "/site-management/residents", implemented: true },
        ],
      },
      {
        label: "Leases & Tenancy",
        implemented: true,
        children: [
          { label: "Manage Funders", implemented: false },
          { label: "Lease Agreements", href: "/site-management/leases", implemented: false },
          { label: "Occupancy and Renewals", href: "/site-management/occupancy", implemented: false },
          { label: "Space Roster", href: "/site-management/space-roster", implemented: true },
        ],
      },
      {
        label: "Revenue & Bill Processing",
        implemented: true,
        children: [
          { label: "Lease Charges", href: "/site-management/billing", implemented: true },
          { label: "One Time Charges", implemented: false },
        ],
      },
      {
        label: "Site Management Admin",
        implemented: true,
        children: [
          { label: "Maintain Space Types", href: "/site-management/admin/space-types", implemented: true },
          { label: "Maintain Checklist Templates", href: "/site-management/admin/checklist-templates", implemented: true },
          { label: "Sites", href: "/site-management/sites", implemented: true },
        ],
      },
    ],
  },
  {
    key: "facilities",
    label: "Facilities",
    href: "/facilities",
    allowedRoles: ["STAFF", "SUPER_ADMIN"],
    nav: [
      { label: "Work Orders", href: "/facilities/work-orders", implemented: true },
      { label: "Assets", href: "/facilities/assets", implemented: false },
      { label: "Vendors", href: "/facilities/vendors", implemented: false },
      { label: "Preventive Maintenance", href: "/facilities/preventive-maintenance", implemented: false },
      { label: "Inspections", href: "/facilities/inspections", implemented: false },
    ],
  },
  {
    key: "security",
    label: "Security",
    href: "/security",
    allowedRoles: ["STAFF", "SUPER_ADMIN"],
    nav: [
      { label: "Incidents", href: "/security/incidents", implemented: true },
      { label: "Visitors", href: "/security/visitors", implemented: false },
      { label: "Access Control", href: "/security/access-control", implemented: false },
      { label: "Reports", href: "/security/reports", implemented: false },
    ],
  },
  {
    key: "cases",
    label: "Case Management",
    href: "/cases",
    allowedRoles: ["STAFF", "SUPER_ADMIN"],
    nav: [
      { label: "Cases", href: "/cases/records", implemented: true },
      { label: "Categories", href: "/cases/categories", implemented: false },
      { label: "Assignments", href: "/cases/assignments", implemented: false },
      { label: "History", href: "/cases/history", implemented: false },
    ],
  },
  {
    key: "admin",
    label: "Admin",
    href: "/admin",
    allowedRoles: ["SUPER_ADMIN"],
    nav: [
      { label: "User Management", href: "/admin/users", implemented: true },
      { label: "Role Management", href: "/admin/roles", implemented: true },
      { label: "Site Configuration", href: "/admin/sites", implemented: true },
      { label: "Edit Bulletin Board", href: "/admin/bulletin-board", implemented: true },
      { label: "Audit Logs", href: "/admin/audit-logs", implemented: false },
    ],
  },
  {
    key: "portal",
    label: "Resident Portal",
    href: "/portal",
    allowedRoles: ["RESIDENT"],
    nav: [
      { label: "Announcements", href: "/portal/announcements", implemented: true },
      { label: "Messages", href: "/portal/messages", implemented: true },
      { label: "Balance", href: "/portal/balance", implemented: true },
      { label: "Service Requests", href: "/portal/requests", implemented: true },
      { label: "Payments", href: "/portal/payments", implemented: true },
    ],
  },
];

export function branchForPath(pathname: string): Branch | undefined {
  return BRANCHES.find((b) => pathname === b.href || pathname.startsWith(b.href + "/"));
}

/** Staff-facing branches shown in the global top navigation. */
export const TOP_NAV_STAFF_BRANCHES = BRANCHES.filter((b) => ["site-management", "facilities", "security", "cases"].includes(b.key));
