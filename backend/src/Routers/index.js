import { Router } from "express";
import { userRouter } from './UserRouter.js';
import { printerRouter } from './PrinterRouter.js';
import { activePrinterRouter } from './ActivePrinterRouter.js';

export const router = Router();

router.use('/users', userRouter);
router.use('/printers', printerRouter);
router.use('/active-printers', activePrinterRouter);
