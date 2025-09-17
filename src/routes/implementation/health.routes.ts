import { Router, Request, Response, NextFunction } from "express";
import { container } from "@/core/container/container";
import { TYPES } from "@/core/container/types";
import { DatabaseConnection } from "@/db/connection/connection";

const router = Router();

router.get(
  "/health",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const db = container.get<DatabaseConnection>(TYPES.DatabaseConnection);
      await db.execute("SELECT 1");
      res.status(200).json({ status: "ok" });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/ready",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const db = container.get<DatabaseConnection>(TYPES.DatabaseConnection);
      await db.execute("SELECT 1");
      res.status(200).json({ ready: true });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

