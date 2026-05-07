import { Router } from 'express';
import ActivePrinterController from '../Controllers/ActivePrinterController.js';

export const activePrinterRouter = Router();

activePrinterRouter.get('/', ActivePrinterController.getAll);
activePrinterRouter.post('/', ActivePrinterController.create);
activePrinterRouter.delete('/:id', ActivePrinterController.delete);
