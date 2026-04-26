// app/lib/utils/measurement-calculator.ts

import { ServiceUnit } from "@/types/zodiac.types";

/**
 * UNIT SCALING REGISTRY
 * Anchors everything to a "Base Unit" for its category.
 */
const SCALES = {
  // AREA/LENGTH (Anchor: Feet)
  inch: { factor: 1 / 12, category: "DIMENSION" },
  ft: { factor: 1, category: "DIMENSION" },
  yd: { factor: 3, category: "DIMENSION" },
  mm: { factor: 1 / 304.8, category: "DIMENSION" },
  cm: { factor: 1 / 30.48, category: "DIMENSION" },
  m: { factor: 3.28084, category: "DIMENSION" },
  meter: { factor: 3.28084, category: "DIMENSION" },
  sqft: { factor: 1, category: "AREA" },
  sqm: { factor: 10.7639, category: "AREA" },
  "Per Sq Meter": { factor: 10.7639, category: "AREA" },
  "Per Yard": { factor: 9, category: "AREA" }, // 1 yard roll = 9 sqft if 3ft wide

  // VOLUME (Anchor: Liter)
  liter: { factor: 1, category: "VOLUME" },
  bottle: { factor: 1, category: "VOLUME" }, // Assuming 1 bottle = 1 unit

  // COUNT (Anchor: Piece)
  piece: { factor: 1, category: "COUNT" },
  pack: { factor: 1, category: "COUNT" },
  box: { factor: 1, category: "COUNT" },
  ream: { factor: 1, category: "COUNT" },
  "Per 100": { factor: 100, category: "COUNT" },
  "Per Set": { factor: 1, category: "COUNT" },

  // TIME (Anchor: Hour)
  hour: { factor: 1, category: "TIME" },
};

export const MeasurementCalculator = {
  /**
   * Universal Resolver:
   * Figures out the "Math Category" of the current app unit.
   */
  getCategory(unit: ServiceUnit) {
    return SCALES[unit as keyof typeof SCALES]?.category || "OTHER";
  },

  /**
   * THE DYNAMIC CALCULATION
   * aware of every unit in your SERVICE_UNITS vault.
   */
  calculate(params: {
    jobWidth?: number;
    jobHeight?: number;
    jobQty: number;
    appUnit: ServiceUnit; // The Unit from your types
    manualRate: number; // The GHS Price
    stockAnchor?: { width: number; height: number };
  }) {
    const { jobWidth, jobHeight, jobQty, appUnit, manualRate, stockAnchor } =
      params;
    const category = this.getCategory(appUnit);
    const unitData = SCALES[appUnit as keyof typeof SCALES];

    // --- LOGIC 1: DIMENSIONAL (Banners, Vinyl, etc.) ---
    if (category === "DIMENSION" || category === "AREA") {
      if (!jobWidth || !jobHeight)
        return { price: 0, error: "Dimensions missing" };

      // Convert job dimensions to match the Anchor Unit (usually Feet/SqFt)
      // Example: Job in Inches -> Anchor in Feet
      const scale = unitData?.factor || 1;
      const calcW = jobWidth * scale;
      const calcH = jobHeight * scale;
      const totalArea = calcW * calcH * jobQty;

      // Check if it fits on the physical roll width
      if (stockAnchor && calcW > stockAnchor.width) {
        return { price: 0, error: `Too wide for ${stockAnchor.width} anchor` };
      }

      return {
        price: totalArea * manualRate,
        area: totalArea,
        deduction: calcH * jobQty, // Deduct linear length from roll
      };
    }

    // --- LOGIC 2: COUNT-BASED (Flyers, Cards, Reams) ---
    if (category === "COUNT") {
      const multiplier = unitData?.factor || 1;
      const totalUnits = jobQty * multiplier;
      return {
        price: totalUnits * manualRate,
        count: totalUnits,
        deduction: jobQty,
      };
    }

    // --- LOGIC 3: DEFAULT (Time, Liter, Others) ---
    return {
      price: jobQty * manualRate,
      deduction: jobQty,
    };
  },
};
