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

/**
 * Generate all base records: org settings, buildings, floors, offices.
 * Offices = ~20 per building × 12 buildings ≈ 240. 70% occupied.
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

  /* 12 buildings, distinct districts, 4–8 floors each */
  const buildings: Building[] = [];
  const floors: Floor[] = [];
  const offices: Office[] = [];

  const BUILDING_NAMES = [
    "Bole Tower", "Atlas Business Center", "Kirkos Plaza", "Yeka Heights",
    "Piassa House", "Sarbet Centre", "Meskel Square Tower", "Kazanchis Tower",
    "CMC Plaza", "Gerji Business Park", "Mexico Square House", "Arat Kilo Centre",
  ];

  for (let i = 0; i < BUILDING_NAMES.length; i++) {
    const name = BUILDING_NAMES[i]!;
    const district = DISTRICTS[i % DISTRICTS.length]!;
    const totalFloors = intBetween(rand, 4, 8);
    const address = `${pick(rand, STREETS)}, ${district}`;

    const building: Building = {
      id: uuid(),
      name,
      address,
      district,
      totalFloors,
      photoSeed: name.toLowerCase().replace(/\s+/g, "-"),
      notes: i % 3 === 0 ? "Premium location. Long-term tenants preferred." : "",
      createdAt: isoFromDate(dateMinusDays(now, intBetween(rand, 200, 700))),
      updatedAt: baseTs,
    };
    buildings.push(building);

    // Floors
    for (let level = 1; level <= totalFloors; level++) {
      const floor: Floor = {
        id: uuid(),
        buildingId: building.id,
        level,
        label: level === 0 ? "Ground" : `Level ${level}`,
        createdAt: building.createdAt,
        updatedAt: baseTs,
      };
      floors.push(floor);

      // Offices per floor: 4 to 8
      const officesOnFloor = intBetween(rand, 4, 8);
      for (let o = 1; o <= officesOnFloor; o++) {
        const officeNumber = `${level}${String.fromCharCode(64 + o)}`; // e.g. 3A, 3B
        const area = intBetween(rand, 25, 180);
        // Rate scales with floor level: higher floors cost more.
        const baseRate = 8000 + level * 1500 + intBetween(rand, 0, 4000);
        // 70% occupied, 22% vacant, 8% maintenance
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
  }

  return { orgSettings, buildings, floors, offices };
}
