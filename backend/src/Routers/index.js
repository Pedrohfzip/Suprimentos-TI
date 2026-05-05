import { Router } from "express";
import { userRouter } from './UserRouter.js';
export const router = Router();

router.use('/users', userRouter);



