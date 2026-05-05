import { Router } from "express";
import { userRouter } from './UserRouter.js';
import { printerRouter } from './PrinterRouter.js';

export const router = Router();

router.use('/users', userRouter);
router.use('/printers', printerRouter);
