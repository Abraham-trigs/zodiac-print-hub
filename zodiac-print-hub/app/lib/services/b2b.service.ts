// lib/services/b2b.service.ts

import { B2BRepository } from "@/lib/repositories/b2b.repository";
import { JobRepository } from "@/lib/repositories/job.repository";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { Outbox } from "@/lib/db/outbox";

export class B2BService {
  static async pushJob(params: {
    orgId: string;
    jobId: string;
    specs: string;
    deadline: Date;
    suggestedPrice?: number;
  }) {
    return UnitOfWork.run(async (tx) => {
      const job = await JobRepository.findById(params.orgId, params.jobId);

      if (!job) throw new Error("Job not found");

      const version = Date.now();

      const b2b = await B2BRepository.create(
        {
          orgId: params.orgId,
          originalJobId: job.id,
          clientName: job.client.name,
          serviceName: job.serviceName,
          specs: params.specs,
          deadline: params.deadline,
          suggestedPrice: params.suggestedPrice,
        },
        tx,
      );

      await Outbox.add(tx, {
        type: "b2b.pushed",
        orgId: params.orgId,
        entityId: b2b.id,
        version,
        payload: b2b,
      });

      return b2b;
    });
  }
}
