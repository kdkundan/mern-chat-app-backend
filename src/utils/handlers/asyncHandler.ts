import { Request, Response, NextFunction } from "express";
import { response } from "./response";

export const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch( (err) => {
        console.error(err);
        response(res, 400, err.message || "An error occurred")
    });
