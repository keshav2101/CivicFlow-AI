import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const tenantIsolation = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Option 1: Tenant ID from authenticated user
  if (req.user && req.user.organizationId) {
    req.tenantId = req.user.organizationId;
    return next();
  }
  
  // Option 2: Tenant ID from header (for webhooks where standard auth isn't used)
  const headerTenantId = req.headers['x-tenant-id'] as string;
  if (headerTenantId) {
    req.tenantId = headerTenantId;
    return next();
  }
  
  // For global webhooks (like WhatsApp), tenant isolation happens later during classification
  next();
};
