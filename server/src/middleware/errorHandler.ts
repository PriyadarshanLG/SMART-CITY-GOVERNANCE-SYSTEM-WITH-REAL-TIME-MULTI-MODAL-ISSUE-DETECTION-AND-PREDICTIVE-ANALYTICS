import type { NextFunction, Request, Response } from 'express';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request payload exceeds the allowed size.' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
}
