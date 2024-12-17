import { Router } from "express";
import express, { Request, Response } from "express";
import userRoutes from "./user/user.routes";
import chatRoutes from "./chat/chat.routes";
import messageRoutes from "./message/message.routes";

const router = Router();

const respondData =
  (status: number, message: string) => (_: Request, res: Response) => {
    res.status(status).send(message);
  };

router.get("/", respondData(200, "Welcome to API Service."));
router.get("/health", respondData(200, "API is running..."));

router.use("/user", userRoutes);
router.use("/chat", chatRoutes);
router.use("/message", messageRoutes);

export default router;
