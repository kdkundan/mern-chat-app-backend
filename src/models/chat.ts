import mongoose from "mongoose";
import { createModel } from "../utils/handlers/model";

const chatSchema = {
  chatName: {
    type: String,
    trim: true,
    default: null,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
}

export default createModel(chatSchema, "chat")
