import { Router } from 'express';
import PrinterController from '../Controllers/PrinterController.js';

export const printerRouter = Router();

printerRouter.get('/', PrinterController.getAllPrinters);
printerRouter.post('/', PrinterController.createPrinter);
printerRouter.patch('/:id/stock', PrinterController.updateStock);
printerRouter.patch('/:id/name', PrinterController.updateName);
