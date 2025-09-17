import { Application } from "express";
import healthRouter from "@/routes/health.routes";
import userRoutes from "@/routes/user.routes";
import gymRoutes from "@/routes/gym.routes";

export const registerRoutes = (app: Application): void => {
  app.use("/", healthRouter);
  app.use("/api/users", userRoutes);
  app.use("/api/gyms", gymRoutes);
};
