import { TYPES } from "@/core/container/types";
import { Router } from "express";
import { attachCrudRoutes } from "@/routes/utils/crud";

const router = Router();
export default attachCrudRoutes(router, TYPES.UserController);
