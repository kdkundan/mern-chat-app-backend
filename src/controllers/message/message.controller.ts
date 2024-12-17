import { asyncHandler } from "../../utils/handlers/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { resp } from "../../utils/handlers/response";
import { saveModel } from "../../utils/handlers/model";
import model from "../../models/message";

export const sendMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = resp(res);

    const { message, chatID, senderID } = req.body;

    if (!message || !chatID || !senderID) {
      console.log("Invalid data passed into request");
      return response(400, "Invalid data passed into request", {
        message,
      });
    }

    try {
      const data = {
        sender : senderID,
        chat : chatID,
        message,
      }
      res.locals.data = (
        await saveModel(model, data)
      )._doc;
    } catch (error) {
      
    }

    next();
  }
);

export const getUserChats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = resp(res);

    const { chatID } = req.params;

    if (!chatID) {
      console.log("Invalid data passed into request");
      return response(400, "Invalid data passed into request", {
        chatID,
      });
    }

    try {
      res.locals.data = await model.find({chat : chatID});
    } catch (error) {
      
    }

    next();
  }
);
