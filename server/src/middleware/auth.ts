import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { verifyJwt } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export function requireAuth(allowedRoles?: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const token = header.slice(7);
      const decoded = verifyJwt(token, env.JWT_ACCESS_SECRET);
      req.user = decoded;

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return next();
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}
