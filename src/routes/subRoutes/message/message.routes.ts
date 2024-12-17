import express from "express";
import {
  createChat,
  userChats,
} from "../../../controllers/chat/chat.controller";
import { respondData } from "../../../utils/handlers/response";
import { getUserChats, sendMessage } from "../../../controllers/message/message.controller";

const router = express.Router();

router.get("/fetch/chatID/:chatID", getUserChats, respondData(200, "Messages fetched successfully"));
router.post("/", sendMessage, respondData(201, "Message saved successfully"));

export default router;
