import express, { Express } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const app: Express = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [], // Add allowed origins
  },
});

export { io, app, server };
