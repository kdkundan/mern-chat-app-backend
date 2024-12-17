import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import {
  healthCheck,
  initMongoose,
  initServer,
  initSocketIO,
  requestLogger,
} from "./utils/handlers/server";
import { setupRoutes } from "./routes";

dotenv.config();

const PORT = process.env.PORT || 5000;
const CONNECTION_URL =
  process.env.MONGO_DB_URL || "mongodb_default_connection_url";

// Create global socket instance that can be imported in other files
let io: SocketIOServer;

// Initialize express and http server
const app = express();
const server = http.createServer(app);

// Initialize socket.io
io = initSocketIO(server);

// Export socket instance to be used in other files
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Initialize middlewares and routes
initServer(app);
requestLogger(app);
setupRoutes(app);
healthCheck(app);

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    await initMongoose(CONNECTION_URL);
    server.listen(PORT, () => {
      console.log(
        `✅✅✅✅✅ Server connected to MongoDB & running on port: ${PORT} ✅✅✅✅✅`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle server shutdown gracefully
const shutdownServer = async () => {
  console.log("Shutting down server...");

  try {
    // Close socket connections
    io.close(() => {
      console.log("Socket.io connections closed");
    });

    // Close HTTP server
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle process termination
process.on("SIGTERM", shutdownServer);
process.on("SIGINT", shutdownServer);

// Start the server
startServer();

// For TypeScript type safety, create a custom error type
export class SocketInitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SocketInitError";
  }
}
