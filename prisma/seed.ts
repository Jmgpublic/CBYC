import { PrismaClient, Role, AnnouncementType, RevenueStatus, ChecklistBranch, ResponsibleRole, SpaceStatus, WorkOrderStatus, Priority, ServiceCategory, ServiceRequestStatus, IncidentSeverity, IncidentStatus, CaseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Development-only credentials. Never use these in a deployed environment.
const DEV_PASSWORD = "Concierge!Dev1";

const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function main() {
  console.log("Clearing existing development data...");
  await prisma.payment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.maintenanceEvent.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.revenueEvent.deleteMany();
  await prisma.case.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklistTemplate.deleteMany();
  await prisma.space.deleteMany();
  await prisma.spaceType.deleteMany();
  await prisma.resident.deleteMany();
  await prisma.site.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  // ---- Users (1 super admin, 1 staff, 1 resident login) ----
  const superAdmin = await prisma.user.create({
    data: { email: "admin@concierge.test", name: "Super Admin", role: Role.SUPER_ADMIN, passwordHash },
  });
  const staff = await prisma.user.create({
    data: { email: "staff@concierge.test", name: "Sam Staff", role: Role.STAFF, passwordHash },
  });
  const residentUser = await prisma.user.create({
    data: { email: "resident@concierge.test", name: "Riley Resident", role: Role.RESIDENT, passwordHash },
  });

  // ---- Sites (2) ----
  const harbor = await prisma.site.create({
    data: { name: "Harbor Point", address: "120 Harbor Way", city: "Seattle", state: "WA", zip: "98101" },
  });
  const summit = await prisma.site.create({
    data: { name: "Summit Ridge", address: "45 Summit Ave", city: "Portland", state: "OR", zip: "97205" },
  });

  // ---- Residents (5). The first is linked to the resident login. ----
  const residentsData = [
    { firstName: "Riley", lastName: "Resident", email: "resident@concierge.test", phone: "555-0101", unit: "A-101", siteId: harbor.id, userId: residentUser.id },
    { firstName: "Jordan", lastName: "Lee", email: "jordan.lee@example.test", phone: "555-0102", unit: "A-102", siteId: harbor.id },
    { firstName: "Casey", lastName: "Morgan", email: "casey.morgan@example.test", phone: "555-0103", unit: "B-201", siteId: harbor.id },
    { firstName: "Taylor", lastName: "Brooks", email: "taylor.brooks@example.test", phone: "555-0104", unit: "S-310", siteId: summit.id },
    { firstName: "Morgan", lastName: "Ellis", email: "morgan.ellis@example.test", phone: "555-0105", unit: "S-312", siteId: summit.id },
  ];
  const residents = [];
  for (const r of residentsData) {
    residents.push(await prisma.resident.create({ data: r }));
  }
  const riley = residents[0];

  // ---- Space types ----
  await prisma.spaceType.createMany({
    data: [
      { name: "Residential Unit", sortOrder: 1 },
      { name: "Common Area", sortOrder: 2 },
      { name: "Office", sortOrder: 3 },
    ],
  });

  // ---- Spaces ----
  const spaces = await Promise.all([
    prisma.space.create({ data: { siteId: harbor.id, spaceType: "Residential Unit", description: "Unit A-101", status: SpaceStatus.OCCUPIED } }),
    prisma.space.create({ data: { siteId: harbor.id, spaceType: "Common Area", description: "Lobby", status: SpaceStatus.VACANT } }),
    prisma.space.create({ data: { siteId: harbor.id, spaceType: "Office", description: "Management Office", status: SpaceStatus.OCCUPIED } }),
    prisma.space.create({ data: { siteId: summit.id, spaceType: "Residential Unit", description: "Unit S-310", status: SpaceStatus.OCCUPIED } }),
    prisma.space.create({ data: { siteId: summit.id, spaceType: "Common Area", description: "Fitness Room", status: SpaceStatus.MAINTENANCE } }),
  ]);

  // ---- Work orders and service requests ----
  const leakWo = await prisma.workOrder.create({
    data: {
      title: "Kitchen sink leak", description: "Slow leak under the kitchen sink.", status: WorkOrderStatus.IN_PROGRESS,
      priority: Priority.HIGH, siteId: harbor.id, spaceId: spaces[0].id, assignedTo: "Sam Staff", assigneeKind: "INTERNAL_STAFF",
    },
  });
  await prisma.serviceRequest.create({
    data: {
      number: "SR-SEED-0001", residentId: riley.id, siteId: harbor.id, category: ServiceCategory.MAINTENANCE,
      type: "Plumbing", description: "Water is leaking from under the kitchen sink.", status: ServiceRequestStatus.ASSIGNED, workOrderId: leakWo.id,
    },
  });
  await prisma.serviceRequest.create({
    data: {
      number: "SR-SEED-0002", residentId: riley.id, siteId: harbor.id, category: ServiceCategory.INFORMATION,
      type: "Parking", description: "Where do I register a second vehicle?", status: ServiceRequestStatus.ACCEPTED,
    },
  });
  await prisma.workOrder.create({
    data: {
      title: "Fitness room HVAC service", description: "Quarterly HVAC inspection and filter change.", status: WorkOrderStatus.OPEN,
      priority: Priority.MEDIUM, siteId: summit.id, spaceId: spaces[4].id, assignedTo: "Northwind HVAC", assigneeKind: "EXTERNAL_VENDOR",
    },
  });

  // ---- Incidents ----
  await prisma.incident.create({
    data: { title: "Lobby door alarm", description: "Side door alarm triggered at 02:15.", severity: IncidentSeverity.MEDIUM, siteId: harbor.id, reportedBy: "Sam Staff", status: IncidentStatus.UNDER_REVIEW },
  });

  // ---- Cases ----
  await prisma.case.create({
    data: { title: "Noise complaint", description: "Repeated late-night noise reported from unit B-201.", category: "Community Standards", status: CaseStatus.OPEN, residentId: residents[2].id, assignedTo: "Sam Staff" },
  });

  // ---- Announcements (Bulletin Board) ----
  await prisma.announcement.createMany({
    data: [
      { title: "Water shutoff on Thursday", content: "Water will be off 9am-12pm for riser maintenance.", type: AnnouncementType.AUDITED, siteId: harbor.id, authorId: staff.id },
      { title: "Summer BBQ this Saturday", content: "Join us at the courtyard from 4pm.", type: AnnouncementType.GENERAL, siteId: harbor.id, authorId: staff.id },
      { title: "Please keep the lobby clear", content: "Packages must be moved within 24 hours.", type: AnnouncementType.NOTE_TO_RESIDENT, siteId: harbor.id, authorId: superAdmin.id },
      { title: "Fitness room closed for service", content: "Closed until the HVAC service is complete.", type: AnnouncementType.AUDITED, siteId: summit.id, authorId: staff.id },
    ],
  });

  // ---- Revenue events (billing) ----
  await prisma.revenueEvent.createMany({
    data: [
      { siteId: harbor.id, residentId: riley.id, spaceType: "Residential Unit", description: "Monthly rent", amount: 1850, status: RevenueStatus.BILLED, dateProposed: daysFromNow(-30), dateBillCreate: daysFromNow(-29), dateDue: daysFromNow(1) },
      { siteId: harbor.id, residentId: riley.id, spaceType: "Residential Unit", description: "Parking fee", amount: 75, status: RevenueStatus.FORECAST, dateProposed: daysFromNow(-2) },
      { siteId: harbor.id, residentId: residents[1].id, spaceType: "Residential Unit", description: "Late fee", amount: 40, status: RevenueStatus.HOLD, dateProposed: daysFromNow(-5) },
      { siteId: harbor.id, residentId: residents[2].id, spaceType: "Residential Unit", description: "Monthly rent", amount: 1900, status: RevenueStatus.FORECAST, dateProposed: daysFromNow(3) },
      { siteId: summit.id, residentId: residents[3].id, spaceType: "Residential Unit", description: "Pet deposit", amount: 300, status: RevenueStatus.FORECAST, dateProposed: daysFromNow(-1) },
    ],
  });

  // ---- Checklist templates (global default + site override) ----
  await prisma.checklistTemplate.create({
    data: {
      name: "Standard Tenant Onboarding",
      description: "Default onboarding checklist for new residents.",
      branch: ChecklistBranch.SITE_MANAGEMENT,
      targetRole: ResponsibleRole.STAFF,
      isActive: true,
      version: 1,
      items: {
        create: [
          { orderIndex: 1, description: "Verify identity", isRequired: true, requiresDocument: true, responsibleRole: ResponsibleRole.STAFF },
          { orderIndex: 2, description: "Proof of income", isRequired: true, requiresDocument: true, responsibleRole: ResponsibleRole.RESIDENT },
          { orderIndex: 3, description: "Sign lease", isRequired: true, requiresDocument: false, responsibleRole: ResponsibleRole.STAFF },
          { orderIndex: 4, description: "Emergency contact on file", isRequired: false, requiresDocument: false, responsibleRole: ResponsibleRole.RESIDENT },
        ],
      },
    },
  });
  await prisma.checklistTemplate.create({
    data: {
      name: "Harbor Point Move-in Addendum",
      description: "Site-specific additions for Harbor Point.",
      branch: ChecklistBranch.SITE_MANAGEMENT,
      siteId: harbor.id,
      targetRole: ResponsibleRole.RESIDENT,
      isActive: true,
      version: 2,
      items: {
        create: [
          { orderIndex: 1, description: "Acknowledge building rules", isRequired: true, requiresDocument: false, responsibleRole: ResponsibleRole.RESIDENT },
        ],
      },
    },
  });

  console.log("Seed complete.");
  console.log("  Super admin: admin@concierge.test");
  console.log("  Staff:       staff@concierge.test");
  console.log("  Resident:    resident@concierge.test");
  console.log("  Password for all dev users is set in prisma/seed.ts (DEV_PASSWORD).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
