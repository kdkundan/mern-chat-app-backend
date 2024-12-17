import mongoose from "mongoose";
import { createModel } from "../utils/handlers/model";

const messageSchema = {
  chat : { type: mongoose.Schema.Types.ObjectId, ref: "chat"},
  sender : { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  message : { type: String, trim: true },
  readBy : [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }], //array because multiple users can read the message
}

export default createModel(messageSchema, "message")