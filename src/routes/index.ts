import { Application } from "express";
import healthRouter from "@/routes/implementation/health.routes";
import userRoutes from "@/routes/implementation/user.routes";
import gymRoutes from "./implementation/gym.routes";

export const registerRoutes = (app: Application): void => {
  app.use("/", healthRouter);
  app.use("/api/users", userRoutes);
  app.use("/api/gyms", gymRoutes);
};
