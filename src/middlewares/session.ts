import session from "express-session";
import connectRedis from "connect-redis";
import { NextFunction, RequestHandler } from "express";
import { Socket, Server as SocketIOServer } from "socket.io";

const sessionMiddleWare = (redisStore: connectRedis): any =>
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
    store: redisStore,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax",
    },
  });

type SocketIOMiddleware = (socket: Socket, next: NextFunction) => void;

export const expressWrapIO = (
  expressMiddleware: any
): any => {
  return (socket: Socket, next: NextFunction) => {
    expressMiddleware(socket.request as any, {} as any, next);
  };
};

export default sessionMiddleWare;
