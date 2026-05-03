import type { Job, Material } from "@prisma/client";

interface NestedJob {
  jobId: string;
  shortRef: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * RESOLVE_LAYOUT
 * The geometric brain of the Shooter Node.
 * Translates a collection of jobs into a physical roll arrangement.
 */
export function resolveLayout(jobs: Job[], material: Material) {
  // 🚀 SAFETY GUARD: Fixes "jobs.map is not a function" error
  // Ensures we always have an array before proceeding.
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0 || !material) {
    return {
      items: [],
      totalLinearInches: 0,
      totalLinearFeet: 0,
      efficiency: 0,
      wasteArea: 0,
    };
  }

  const rollWidth = material.rollWidth || 60; // Standard 60" roll fallback
  const safetyBleed = 0.25; // Industrial spacing between jobs

  let currentX = 0;
  let currentY = 0;
  let maxRowHeight = 0;
  let totalJobArea = 0;

  // 1. PHASE: Geometric Nesting (Shelf-Packing Algorithm)
  const nestedItems: NestedJob[] = jobs.map((job) => {
    // Ensure dimensions exist, fallback to 0 to prevent NaN math
    const jWidth = job.width || 0;
    const jHeight = job.height || 0;

    const jobWidthWithBleed = jWidth + safetyBleed * 2;
    const jobHeightWithBleed = jHeight + safetyBleed * 2;

    // If job exceeds current row width, jump to next row
    if (currentX + jobWidthWithBleed > rollWidth) {
      currentX = 0;
      currentY += maxRowHeight;
      maxRowHeight = 0;
    }

    const item = {
      jobId: job.id,
      shortRef: job.shortRef,
      x: currentX + safetyBleed,
      y: currentY + safetyBleed,
      width: jWidth,
      height: jHeight,
    };

    // Update markers for next item
    currentX += jobWidthWithBleed;
    maxRowHeight = Math.max(maxRowHeight, jobHeightWithBleed);
    totalJobArea += jWidth * jHeight;

    return item;
  });

  // 2. PHASE: Material Math
  const totalLinearInches = currentY + maxRowHeight;
  const totalCapacityArea = totalLinearInches * rollWidth;

  // 3. PHASE: Efficiency Intelligence
  const efficiency =
    totalCapacityArea > 0 ? (totalJobArea / totalCapacityArea) * 100 : 0;

  return {
    items: nestedItems,
    totalLinearInches: Math.round(totalLinearInches * 100) / 100,
    totalLinearFeet: Math.round((totalLinearInches / 12) * 100) / 100,
    efficiency: Math.round(efficiency * 10) / 10, // e.g., 94.2%
    wasteArea:
      Math.round(Math.max(0, totalCapacityArea - totalJobArea) * 100) / 100,
  };
}
