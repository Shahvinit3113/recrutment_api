import { UserController } from "@/controllers/implementation/user.controller";
import { container } from "@/core/container/container";
import { TYPES } from "@/core/container/types";
import { Router } from "express";

const router = Router();

const controller = container.get<UserController>(TYPES.UserController);

router.get("/all", (req, res) => controller.getAll(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

export default router;
