import express from "express";
import {
  createChat,
  userChats,
} from "../../../controllers/chat/chat.controller";
import { respondData } from "../../../utils/handlers/response";

const router = express.Router();

router.post("/", createChat, respondData(201, "Chat created Successfully"));
router.get(
  "/:userID",
  userChats,
  respondData(200, "Chat fetched Successfully")
);

export default router;
