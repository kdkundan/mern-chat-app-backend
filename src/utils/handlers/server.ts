import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer, Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { handleConnection } from "./socketHandlers";

// Track active users and their socket connections
const activeUsers = new Map<string, Socket>();

export const initServer = (app: Express): HTTPServer => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.set("trust proxy", true);

  app.use((_, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
};

export const initSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // Add connection logging
  io.on("connection", (socket) => {
    console.log("Socket initialized with ID:", socket.id);

    // Add error handling
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    handleConnection(io, socket);
  });

  return io;
};

export const initMongoose = (
  CONNECTION_URL: string
): Promise<typeof mongoose> => mongoose.connect(CONNECTION_URL);

export const requestLogger = (server: Express) =>
  server.use((req: Request, _: Response, next: NextFunction) => {
    console.log(`${req.path}?${JSON.stringify(req.query)}`, req.body);
    next();
  });

export const healthCheck = (server: Express): void => {
  const respondData =
    (status: number, message: string) => (_: Request, res: Response) => {
      res.status(status).send(message);
    };

  server.get("/", respondData(200, "Welcome to API Service."));
  server.get("/health", respondData(200, "API is running..."));
};
