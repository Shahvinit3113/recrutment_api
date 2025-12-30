import { RouteLoader } from "@/core/helper/route-loader";
import { Router } from "express";
import { container } from "@/core/container/container";
import { getRegisteredControllers } from "@/core/container/auto-register";

/**
 * ============================================================================
 * CONTROLLER ROUTE INITIALIZATION
 * ============================================================================
 *
 * This module supports two modes:
 *
 * 1. AUTO MODE (recommended):
 *    Uses @AutoController decorator and auto-registration.
 *    No manual listing required.
 *
 * 2. LEGACY MODE:
 *    Manual import and registration of each controller.
 *    Kept for backward compatibility.
 *
 * To migrate to auto mode:
 * 1. Add @AutoController("/prefix") to your controllers
 * 2. Import them in a central place (e.g., here or app.ts)
 * 3. Call autoRegister(container) in container setup
 * 4. Use initiControllersRoutesAuto() instead of initiControllersRoutes()
 */

// ============================================================================
// LEGACY MODE - Manual imports (current approach)
// ============================================================================

import { UserController } from "./implementation/user.controller";
import { UserInfoController } from "./implementation/user-info.controller";
import { AuthController } from "./implementation/auth.controller";
import { TaskController } from "./implementation/task.controller";
import { PositionsController } from "./implementation/positions.controller";
import { OrganizationController } from "./implementation/organization.controller";
import { DepartmentController } from "./implementation/department.controller";
import { FormTemplateController } from "./implementation/form_template.controller";
import { FormSectionController } from "./implementation/form_section.controller";
import { FormFieldController } from "./implementation/form_field.controller";

/**
 * Legacy controller registration (manual approach)
 * @deprecated Use initiControllersRoutesAuto() with @AutoController decorator
 */
export function initiControllersRoutes() {
  const router = Router();
  RouteLoader.loadMultipleControllers(
    router,
    [
      UserController,
      UserInfoController,
      AuthController,
      TaskController,
      PositionsController,
      OrganizationController,
      DepartmentController,
      FormTemplateController,
      FormSectionController,
      FormFieldController,
    ],
    container
  );

  return router;
}

// ============================================================================
// AUTO MODE - Automatic discovery (new approach)
// ============================================================================

/**
 * Auto-discover and register all controllers decorated with @AutoController
 *
 * Prerequisites:
 * 1. Controllers must be decorated with @AutoController("/prefix")
 * 2. Controllers must be imported somewhere before this is called
 * 3. autoRegister(container) must be called during container setup
 *
 * @example
 * // In app.ts
 * import "@/controllers"; // Import controllers module to trigger decorators
 * import { initiControllersRoutesAuto } from "@/controllers";
 *
 * app.use("/api", initiControllersRoutesAuto());
 */
export function initiControllersRoutesAuto() {
  const router = Router();
  const controllers = getRegisteredControllers();

  if (controllers.length === 0) {
    console.warn(
      "⚠ No controllers registered via @AutoController. " +
        "Make sure controllers are imported before calling this function."
    );
  }

  RouteLoader.loadMultipleControllers(router, controllers, container);

  return router;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Re-export all controllers for manual import if needed
export {
  UserController,
  UserInfoController,
  AuthController,
  TaskController,
  PositionsController,
  OrganizationController,
  DepartmentController,
  FormTemplateController,
  FormSectionController,
  FormFieldController,
};
