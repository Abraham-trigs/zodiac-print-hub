import type { ServiceUnit } from "@/types/zodiac.types";

/* =========================================================
   RESULT TYPES (STRICT CONTRACT)
========================================================= */

export type MeasurementResult =
  | {
      price: number;
      area: number;
      deduction: number;
      error?: never;
      count?: never;
    }
  | {
      price: number;
      count: number;
      deduction: number;
      error?: never;
      area?: never;
    }
  | {
      price: number;
      deduction: number;
      error?: string;
      area?: never;
      count?: never;
    };

/* =========================================================
   UNIT SCALE REGISTRY
========================================================= */

const SCALES = {
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
  "Per Yard": { factor: 9, category: "AREA" },

  liter: { factor: 1, category: "VOLUME" },
  bottle: { factor: 1, category: "VOLUME" },

  piece: { factor: 1, category: "COUNT" },
  pack: { factor: 1, category: "COUNT" },
  box: { factor: 1, category: "COUNT" },
  ream: { factor: 1, category: "COUNT" },
  "Per 100": { factor: 100, category: "COUNT" },
  "Per Set": { factor: 1, category: "COUNT" },

  hour: { factor: 1, category: "TIME" },
} as const;

/* =========================================================
   ENGINE
========================================================= */

export const MeasurementCalculator = {
  getCategory(unit: ServiceUnit) {
    return SCALES[unit as keyof typeof SCALES]?.category ?? "OTHER";
  },

  calculate(params: {
    jobWidth?: number;
    jobHeight?: number;
    jobQty: number;
    appUnit: ServiceUnit;
    manualRate: number;
    stockAnchor?: { width: number; height: number };
  }): MeasurementResult {
    const { jobWidth, jobHeight, jobQty, appUnit, manualRate, stockAnchor } =
      params;

    const unitData = SCALES[appUnit as keyof typeof SCALES];
    const category = unitData?.category ?? "OTHER";

    /* =====================================================
       DIMENSION / AREA
    ===================================================== */
    if (category === "DIMENSION" || category === "AREA") {
      if (!jobWidth || !jobHeight) {
        return {
          price: 0,
          deduction: 0,
          error: "Dimensions missing",
        };
      }

      const scale = unitData?.factor ?? 1;
      const w = jobWidth * scale;
      const h = jobHeight * scale;

      if (stockAnchor && w > stockAnchor.width) {
        return {
          price: 0,
          deduction: 0,
          error: `Too wide for ${stockAnchor.width} anchor`,
        };
      }

      const area = w * h * jobQty;

      return {
        price: area * manualRate,
        area,
        deduction: h * jobQty,
      };
    }

    /* =====================================================
       COUNT BASED
    ===================================================== */
    if (category === "COUNT") {
      const multiplier = unitData?.factor ?? 1;
      const count = jobQty * multiplier;

      return {
        price: count * manualRate,
        count,
        deduction: jobQty,
      };
    }

    /* =====================================================
       DEFAULT
    ===================================================== */
    return {
      price: jobQty * manualRate,
      deduction: jobQty,
    };
  },
};
