import { prisma } from "@lib/prisma-client";
import { StaffPerformance } from "@prisma/client";

/**
 * STAFF_PERFORMANCE_SERVICE
 * The Industrial KPI Engine.
 * Translates production events into measurable performance data.
 */
export class StaffPerformanceService {
  /**
   * RECORD_DESIGN_VELOCITY
   * Measures how fast a designer prepares a proof after job intake.
   */
  static async recordDesignVelocity(params: {
    jobId: string;
    staffId: string;
    orgId: string;
  }) {
    const job = await prisma.job.findUnique({
      where: { id: params.jobId },
      select: { createdAt: true },
    });

    if (!job) return;

    // Calculate time elapsed since creation in minutes
    const start = new Date(job.createdAt).getTime();
    const end = new Date().getTime();
    const velocityMinutes = Math.round((end - start) / (1000 * 60));

    return await prisma.staffPerformance.create({
      data: {
        staffId: params.staffId,
        orgId: params.orgId,
        metricType: "DESIGN_VELOCITY",
        value: velocityMinutes,
        jobId: params.jobId,
        note: `Proof uploaded in ${velocityMinutes}m`,
      },
    });
  }

  /**
   * RECORD_PRINT_YIELD
   * Captures the efficiency of a material 'Shoot' from the Layout Builder.
   */
  static async recordPrintYield(params: {
    staffId: string;
    orgId: string;
    efficiency: number; // e.g. 98.5
    layoutId: string;
  }) {
    return await prisma.staffPerformance.create({
      data: {
        staffId: params.staffId,
        orgId: params.orgId,
        metricType: "PRINT_EFFICIENCY",
        value: params.efficiency,
        jobId: params.layoutId, // Linking to the layout record
        note: `Layout efficiency optimized to ${params.efficiency}%`,
      },
    });
  }

  /**
   * GET_LEADERBOARD
   * Compiles the ranking for the Performance Node UI.
   */
  static async getLeaderboard(orgId: string) {
    // 🧠 LOGIC: Aggregate metrics per staff member for the current month
    const staff = await prisma.staff.findMany({
      where: { orgId },
      include: {
        performance: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
      },
    });

    return staff
      .map((s) => {
        const designMetrics = s.performance.filter(
          (p) => p.metricType === "DESIGN_VELOCITY",
        );
        const yieldMetrics = s.performance.filter(
          (p) => p.metricType === "PRINT_EFFICIENCY",
        );

        const avgVelocity = designMetrics.length
          ? designMetrics.reduce((sum, p) => sum + p.value, 0) /
            designMetrics.length
          : 0;

        const avgYield = yieldMetrics.length
          ? yieldMetrics.reduce((sum, p) => sum + p.value, 0) /
            yieldMetrics.length
          : 100;

        return {
          id: s.id,
          name: s.name,
          avgVelocity: Math.round(avgVelocity),
          avgYield: avgYield.toFixed(1),
          jobCount: s.performance.length,
          rankScore: avgYield * 10 - avgVelocity * 0.5, // Industrial weighting logic
        };
      })
      .sort((a, b) => b.rankScore - a.rankScore);
  }
}
