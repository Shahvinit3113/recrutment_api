import { Router } from "express";
import { withController } from "@/routes/utils/withController";

export const attachCrudRoutes = (
  router: Router,
  token: string | symbol
): Router => {
  router.get(
    "/all",
    withController<any>(token, (c, req, res) => c.getAll(req, res))
  );
  router.get(
    "/:id",
    withController<any>(token, (c, req, res) => c.getById(req as any, res))
  );
  router.post(
    "/",
    withController<any>(token, (c, req, res) => c.create(req, res))
  );
  router.put(
    "/:id",
    withController<any>(token, (c, req, res) => c.update(req as any, res))
  );
  router.delete(
    "/:id",
    withController<any>(token, (c, req, res) => c.delete(req as any, res))
  );
  return router;
};
