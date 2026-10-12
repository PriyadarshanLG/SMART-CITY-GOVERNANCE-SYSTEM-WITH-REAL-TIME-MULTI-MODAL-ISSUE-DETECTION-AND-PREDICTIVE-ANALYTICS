import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { complaintRouter } from './complaintRoutes.js';
import { healthRouter } from './healthRoutes.js';
import { locationRouter } from './locationRoutes.js';
import { speechRouter } from './speechRoutes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/complaints', complaintRouter);
apiRouter.use('/speech', speechRouter);
apiRouter.use('/location', locationRouter);
