import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth';

const prisma = new PrismaClient();

export const auditLog = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // We attach an end hook to response to log after it completes
    res.on('finish', async () => {
      try {
        if (req.tenantId || (req.user && req.user.organizationId)) {
          await prisma.auditLog.create({
            data: {
              organizationId: req.tenantId || req.user?.organizationId || '',
              action: `${req.method} ${req.originalUrl} - ${action} - ${res.statusCode}`,
              actorId: req.user?.id,
              targetId: null, // Depending on context, this could be populated dynamically
              details: {
                method: req.method,
                ip: req.ip,
                status: res.statusCode
              }
            }
          });
        }
      } catch (err) {
        console.error("Failed to write audit log:", err);
      }
    });
    next();
  };
};
