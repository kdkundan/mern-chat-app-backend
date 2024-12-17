import { Express, Request, Response } from "express"; // Import Express type
import subRoutes from "./subRoutes/index";

export const setupRoutes = (server: Express) => {
  server.use("/api/v1", subRoutes);
};
