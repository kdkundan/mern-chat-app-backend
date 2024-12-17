import { Request, Response, NextFunction } from "express";
import ChatModel from "../../models/chat";

// Optional: Define interfaces for request bodies if needed
interface CreateChatRequestBody {
  senderID: string;
  receiverID: string;
}

export const createChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newChat = new ChatModel({
      members: [req.body.senderID, req.body.receiverID],
    });
    const savedChat = await newChat.save(); // Renamed variable to avoid naming conflict
    res.locals.data = { chat: savedChat }; // Renamed variable to avoid naming conflict
    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const userChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const chats = await ChatModel.find({
      members: { $in: [req.params.userID] },
    })
      .populate("members", "-password")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 });

    res.locals.data = chats;
    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
