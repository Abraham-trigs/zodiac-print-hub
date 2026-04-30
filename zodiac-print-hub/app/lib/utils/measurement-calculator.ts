import {
  ServiceUnit,
  MaterialCalculationType,
  ServiceCalculationType,
} from "@prisma/client";

/* =========================================================
   UNIT CONVERSION REGISTRY (Normalised to Feet/Units)
========================================================= */
const UNIT_FACTORS: Partial<Record<ServiceUnit, number>> = {
  // Linear / Dimensions -> Normalized to Feet
  inch: 1 / 12,
  ft: 1,
  yd: 3,
  mm: 1 / 304.8,
  cm: 1 / 30.48,
  m: 3.28084,
  meter: 3.28084,
  // Area -> Normalized to SqFt
  sqft: 1,
  sqm: 10.7639,
  PER_SQ_METER: 10.7639,
  PER_YARD: 9, // 1 yard length = 9sqft if 1yd wide
  // Count / Discrete
  PER_100: 100,
  piece: 1,
  pack: 1,
  // Time
  hour: 1,
};

export const ProductionCalculator = {
  calculate(params: {
    quantity: number;
    width?: number;
    height?: number;
    unit: ServiceUnit;
    salePrice: number;
    purchasePrice?: number;
    mCalcType?: MaterialCalculationType; // From Material model
    sCalcType?: ServiceCalculationType; // From Service model
  }) {
    const {
      quantity,
      width,
      height,
      unit,
      salePrice,
      purchasePrice = 0,
      mCalcType,
      sCalcType,
    } = params;

    const factor = UNIT_FACTORS[unit] ?? 1;

    /* ─────────────────────────────────────────────────────────────
       1. DIMENSIONAL / AREA_BASED LOGIC
       Logic: (W * factor) * (H * factor) * Qty
       Used for: Vinyl, Flex, Acrylic, Installation Labor
       ───────────────────────────────────────────────────────────── */
    if (mCalcType === "DIMENSIONAL" || sCalcType === "AREA_BASED") {
      if (!width || !height) return { error: "Dimensions (W & H) required" };

      const wFeet = width * factor;
      const hFeet = height * factor;
      const totalArea = wFeet * hFeet * quantity;

      return {
        totalPrice: totalArea * salePrice,
        totalCost: totalArea * purchasePrice,
        deduction: totalArea, // Deduct total area from stock
        usageLabel: `${totalArea.toFixed(2)} sqft`,
      };
    }

    /* ─────────────────────────────────────────────────────────────
       2. LINEAR LOGIC
       Logic: (W * factor) * Qty
       Used for: Framing, Binding Coils, Bordering
       ───────────────────────────────────────────────────────────── */
    if (mCalcType === "LINEAR") {
      if (!width) return { error: "Length (Width) required" };

      const totalLength = width * factor * quantity;

      return {
        totalPrice: totalLength * salePrice,
        totalCost: totalLength * purchasePrice,
        deduction: totalLength,
        usageLabel: `${totalLength.toFixed(2)} ft`,
      };
    }

    /* ─────────────────────────────────────────────────────────────
       3. FLAT / PER_UNIT / FIXED LOGIC
       Logic: Qty * UnitFactor * Price
       Used for: Business Cards, Design Fees, Eyelets, Pens
       ───────────────────────────────────────────────────────────── */
    // Default to Flat/Fixed if no specific type is matched
    const unitMultiplier = unit === "PER_100" ? 100 : 1;
    const totalCount = quantity * unitMultiplier;

    return {
      totalPrice: totalCount * salePrice,
      totalCost: totalCount * purchasePrice,
      deduction: totalCount,
      usageLabel: `${totalCount} units`,
    };
  },
};

// import type { ServiceUnit } from "@/types/zodiac.types";

// /* =========================================================
//    RESULT TYPES (STRICT CONTRACT)
// ========================================================= */

// export type MeasurementResult =
//   | {
//       price: number;
//       area: number;
//       deduction: number;
//       error?: never;
//       count?: never;
//     }
//   | {
//       price: number;
//       count: number;
//       deduction: number;
//       error?: never;
//       area?: never;
//     }
//   | {
//       price: number;
//       deduction: number;
//       error?: string;
//       area?: never;
//       count?: never;
//     };

// /* =========================================================
//    UNIT SCALE REGISTRY
// ========================================================= */

// const SCALES = {
//   inch: { factor: 1 / 12, category: "DIMENSION" },
//   ft: { factor: 1, category: "DIMENSION" },
//   yd: { factor: 3, category: "DIMENSION" },
//   mm: { factor: 1 / 304.8, category: "DIMENSION" },
//   cm: { factor: 1 / 30.48, category: "DIMENSION" },
//   m: { factor: 3.28084, category: "DIMENSION" },
//   meter: { factor: 3.28084, category: "DIMENSION" },

//   sqft: { factor: 1, category: "AREA" },
//   sqm: { factor: 10.7639, category: "AREA" },
//   "Per Sq Meter": { factor: 10.7639, category: "AREA" },
//   "Per Yard": { factor: 9, category: "AREA" },

//   liter: { factor: 1, category: "VOLUME" },
//   bottle: { factor: 1, category: "VOLUME" },

//   piece: { factor: 1, category: "COUNT" },
//   pack: { factor: 1, category: "COUNT" },
//   box: { factor: 1, category: "COUNT" },
//   ream: { factor: 1, category: "COUNT" },
//   "Per 100": { factor: 100, category: "COUNT" },
//   "Per Set": { factor: 1, category: "COUNT" },

//   hour: { factor: 1, category: "TIME" },
// } as const;

// /* =========================================================
//    ENGINE
// ========================================================= */

// export const MeasurementCalculator = {
//   getCategory(unit: ServiceUnit) {
//     return SCALES[unit as keyof typeof SCALES]?.category ?? "OTHER";
//   },

//   calculate(params: {
//     jobWidth?: number;
//     jobHeight?: number;
//     jobQty: number;
//     appUnit: ServiceUnit;
//     manualRate: number;
//     stockAnchor?: { width: number; height: number };
//   }): MeasurementResult {
//     const { jobWidth, jobHeight, jobQty, appUnit, manualRate, stockAnchor } =
//       params;

//     const unitData = SCALES[appUnit as keyof typeof SCALES];
//     const category = unitData?.category ?? "OTHER";

//     /* =====================================================
//        DIMENSION / AREA
//     ===================================================== */
//     if (category === "DIMENSION" || category === "AREA") {
//       if (!jobWidth || !jobHeight) {
//         return {
//           price: 0,
//           deduction: 0,
//           error: "Dimensions missing",
//         };
//       }

//       const scale = unitData?.factor ?? 1;
//       const w = jobWidth * scale;
//       const h = jobHeight * scale;

//       if (stockAnchor && w > stockAnchor.width) {
//         return {
//           price: 0,
//           deduction: 0,
//           error: `Too wide for ${stockAnchor.width} anchor`,
//         };
//       }

//       const area = w * h * jobQty;

//       return {
//         price: area * manualRate,
//         area,
//         deduction: h * jobQty,
//       };
//     }

//     /* =====================================================
//        COUNT BASED
//     ===================================================== */
//     if (category === "COUNT") {
//       const multiplier = unitData?.factor ?? 1;
//       const count = jobQty * multiplier;

//       return {
//         price: count * manualRate,
//         count,
//         deduction: jobQty,
//       };
//     }

//     /* =====================================================
//        DEFAULT
//     ===================================================== */
//     return {
//       price: jobQty * manualRate,
//       deduction: jobQty,
//     };
//   },
// };
