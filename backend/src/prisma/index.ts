import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient().$extends({
  query: {
    auditLog: {
      async update({ args, query }) {
        throw new Error("Compliance Violation: Audit logs are append-only. Updates are strictly forbidden.");
      },
      async delete({ args, query }) {
        throw new Error("Compliance Violation: Audit logs are append-only. Deletions are strictly forbidden.");
      },
      async deleteMany({ args, query }) {
        throw new Error("Compliance Violation: Audit logs are append-only. Deletions are strictly forbidden.");
      }
    }
  }
});
