import type { Building, Floor, Office, OrgSettings } from "@/schemas";
import {
  mulberry32,
  SEED,
  pick,
  intBetween,
  round2,
  uuid,
  isoFromDate,
  dateMinusDays,
} from "./random";
import { DISTRICTS } from "@/config/entities";
import { COMPANIES, STREETS } from "./data-pools";
import { ACTIVE_BUILDING_ID } from "@/config/app";

/**
 * Generate all base records: org settings, buildings, floors, offices.
 * Single-building SaaS model — generates exactly ONE building (ACTIVE_BUILDING_ID).
 * Offices ≈ 12 floors × 5 offices ≈ 60. 70% occupied.
 */
export function generateBase() {
  const rand = mulberry32(SEED);
  const now = new Date();
  const baseTs = now.toISOString();

  /* OrgSettings — singleton */
  const orgSettings: OrgSettings = {
    id: "singleton",
    orgName: "Bole Properties PLC",
    logoSeed: "bole-properties",
    currency: "ETB",
    vatRate: 0.15,
    adminName: "Kidus Abdula",
    adminEmail: "admin@rentflow.et",
    address: "Bole Road, Addis Ababa, Ethiopia",
    phone: "+251 11 555 0100",
    updatedAt: baseTs,
  };

  /* Single building — SaaS model */
  const buildings: Building[] = [];
  const floors: Floor[] = [];
  const offices: Office[] = [];

  // Exactly one building with ACTIVE_BUILDING_ID
  const name = "Bole Tower";
  const district = "Bole";
  const totalFloors = 12;
  const address = `${pick(rand, STREETS)}, ${district}`;

  const building: Building = {
    id: ACTIVE_BUILDING_ID,
    name,
    address,
    district,
    totalFloors,
    photoSeed: "bole-tower",
    notes: "Primary building. Premium location. Long-term tenants preferred.",
    createdAt: isoFromDate(dateMinusDays(now, 500)),
    updatedAt: baseTs,
  };
  buildings.push(building);

  // Floors (12 levels)
  for (let level = 1; level <= totalFloors; level++) {
    const floor: Floor = {
      id: uuid(),
      buildingId: building.id,
      level,
      label: `Level ${level}`,
      createdAt: building.createdAt,
      updatedAt: baseTs,
    };
    floors.push(floor);

    // Offices per floor: 4 to 8
    const officesOnFloor = intBetween(rand, 4, 8);
    for (let o = 1; o <= officesOnFloor; o++) {
      const officeNumber = `${level}${String.fromCharCode(64 + o)}`;
      const area = intBetween(rand, 25, 180);
      const baseRate = 8000 + level * 1500 + intBetween(rand, 0, 4000);
      const r = rand();
      const status: Office["status"] =
        r < 0.7 ? "occupied" : r < 0.92 ? "vacant" : "maintenance";

      const office: Office = {
        id: uuid(),
        buildingId: building.id,
        floorId: floor.id,
        number: officeNumber,
        area,
        monthlyRate: round2(baseRate),
        status,
        createdAt: building.createdAt,
        updatedAt: baseTs,
      };
      offices.push(office);
    }
  }

  return { orgSettings, buildings, floors, offices };
}
