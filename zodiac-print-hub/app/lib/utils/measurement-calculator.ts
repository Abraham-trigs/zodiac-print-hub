// src/lib/utils/production-calculator.ts
import {
  ServiceUnit,
  MaterialCalculationType,
  ServiceCalculationType,
} from "@prisma/client";

/* =========================================================
   UNIT CONVERSION REGISTRY (Normalised to Feet/Units)
   Ensures math consistency across different measurement systems.
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
  PER_YARD: 9, // Standard 1yd x 1yd area
  // Count / Discrete
  PER_100: 1, // Handled specifically in FLAT logic
  piece: 1,
  pack: 1,
  // Time
  hour: 1,
};

export const ProductionCalculator = {
  /**
   * THE ENGINE
   * Calculates Revenue, Cost, and Stock Deduction based on Recipe Logic.
   */
  calculate(params: {
    quantity: number;
    width?: number;
    height?: number;
    unit: ServiceUnit;
    salePrice: number;
    purchasePrice?: number;
    mCalcType?: MaterialCalculationType;
    sCalcType?: ServiceCalculationType;
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
       Math: (Width * Factor) * (Height * Factor) * Quantity
       ───────────────────────────────────────────────────────────── */
    if (mCalcType === "DIMENSIONAL" || sCalcType === "AREA_BASED") {
      if (!width || !height) return { error: "Dimensions (W & H) required" };

      const wFeet = width * factor;
      const hFeet = height * factor;
      const totalArea = wFeet * hFeet * quantity;

      return {
        totalPrice: totalArea * salePrice,
        totalCost: totalArea * purchasePrice,
        deduction: totalArea,
        usageLabel: `${totalArea.toFixed(2)} sqft`,
      };
    }

    /* ─────────────────────────────────────────────────────────────
       2. LINEAR LOGIC
       Math: (Width/Length * Factor) * Quantity
       ───────────────────────────────────────────────────────────── */
    if (mCalcType === "LINEAR") {
      if (!width) return { error: "Length (Width field) required" };

      const totalLength = width * factor * quantity;

      return {
        totalPrice: totalLength * salePrice,
        totalCost: totalLength * purchasePrice,
        deduction: totalLength,
        usageLabel: `${totalLength.toFixed(2)} ft`,
      };
    }

    /* ─────────────────────────────────────────────────────────────
       3. FLAT / FIXED / PER_UNIT / VOLUMETRIC LOGIC
       Math: Quantity * Price (with specific Unit multipliers)
       ───────────────────────────────────────────────────────────── */
    // Special handling for bulk units like "Per 100"
    let effectiveQuantity = quantity;
    if (unit === "PER_100") {
      effectiveQuantity = quantity / 100;
    }

    // FIXED Service logic: One-time fee regardless of quantity
    const isFixed = sCalcType === "FIXED";
    const finalQuantity = isFixed ? 1 : effectiveQuantity;

    return {
      totalPrice: finalQuantity * salePrice,
      totalCost: finalQuantity * purchasePrice,
      deduction: finalQuantity,
      usageLabel: isFixed ? "Fixed Fee" : `${finalQuantity} units`,
    };
  },
};
