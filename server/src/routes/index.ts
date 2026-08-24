import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { complaintRouter } from './complaintRoutes.js';
import { healthRouter } from './healthRoutes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/complaints', complaintRouter);
