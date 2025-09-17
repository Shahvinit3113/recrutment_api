import { Router } from "express";
import { TYPES } from "@/core/container/types";
import { attachCrudRoutes } from "./utils/crud";

const router = Router();
export default attachCrudRoutes(router, TYPES.GymController);
