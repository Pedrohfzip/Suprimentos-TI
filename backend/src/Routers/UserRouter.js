import { Router } from "express";
import UserController from '../Controllers/UserController.js';
export const userRouter = Router();

userRouter.post('/', UserController.createUser);