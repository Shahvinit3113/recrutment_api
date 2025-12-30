/**
 * ============================================================================
 * AUTO-REGISTRATION EXAMPLE
 * ============================================================================
 *
 * This file demonstrates how to use the auto-registration system
 * for services and controllers, eliminating manual registration boilerplate.
 */

import { Service, AutoController } from "@/core/container/auto-register";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { DatabaseConnection } from "@/db/connection/connection";
import { BaseController } from "@/controllers/base/base.controller";
import { Get, Post } from "@/core/decorators/route.decorator";
import { ValidateBodySchema } from "@/core/decorators/schema-validation.decorator";
import {
  BodyRequest,
  ParamsRequest,
  TypedResponse,
} from "@/core/types/express.types";
import {
  Response as ApiResponseClass,
  SingleResult,
  ApiResponse,
} from "@/data/response/response";
import { z } from "zod";

// ============================================================================
// EXAMPLE 1: Auto-registering a Service
// ============================================================================

/**
 * Before (Manual registration in 4 places):
 * 1. Define Symbol in types.ts
 * 2. Bind in container.ts
 * 3. Import service class
 * 4. Inject using TYPES.ServiceName
 *
 * After (Auto-registration):
 * Just add @Service() decorator and you're done!
 */

// Define the schema
const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  description: z.string().optional(),
});

type CreateProductDto = z.infer<typeof CreateProductSchema>;

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

// 1. Decorate your service with @Service
@Service({ scope: "request" }) // Options: singleton, request, transient
export class ProductService {
  constructor(
    @inject(TYPES.DatabaseConnection) private db: DatabaseConnection
  ) {}

  async create(data: CreateProductDto): Promise<Product> {
    const id = Math.random().toString(36);
    // Your business logic here
    return { id, ...data };
  }

  async getById(id: string): Promise<Product | null> {
    // Your business logic here
    return null;
  }

  async getAll(): Promise<Product[]> {
    // Your business logic here
    return [];
  }
}

// ============================================================================
// EXAMPLE 2: Auto-registering a Controller
// ============================================================================

/**
 * Before (Manual registration):
 * 1. Bind controller in container.ts
 * 2. Import controller in controllers/index.ts
 * 3. Add to RouteLoader.loadMultipleControllers array
 *
 * After (Auto-registration):
 * Just add @AutoController decorator!
 */

@AutoController("/products") // Automatically registers and sets route prefix
export class ProductController {
  constructor(
    // Inject using the auto-registered service's symbol
    @inject(Symbol.for("ProductService")) private productService: ProductService
  ) {}

  /**
   * GET /api/products/:id
   */
  @Get("/:id")
  async getById(
    req: ParamsRequest<{ id: string }>,
    res: TypedResponse<ApiResponseClass<SingleResult<Product>>>
  ) {
    const product = await this.productService.getById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .send(
          new ApiResponseClass(
            false,
            404,
            "Product not found",
            SingleResult.empty<Product>()
          )
        );
    }

    return res.send(ApiResponse.single(product));
  }

  /**
   * POST /api/products
   * With automatic validation!
   */
  @ValidateBodySchema(CreateProductSchema)
  @Post("/")
  async create(
    req: BodyRequest<CreateProductDto>,
    res: TypedResponse<ApiResponseClass<SingleResult<Product>>>
  ) {
    // req.body is already validated and typed!
    const product = await this.productService.create(req.body);
    return res.send(ApiResponse.created(product));
  }

  /**
   * GET /api/products
   */
  @Get("/")
  async getAll(req: any, res: TypedResponse<ApiResponseClass<Product[]>>) {
    const products = await this.productService.getAll();
    return res.send(new ApiResponseClass(true, 200, "Success", products));
  }
}

// ============================================================================
// SETUP IN CONTAINER
// ============================================================================

/**
 * In your container.ts file, after manual bindings, add:
 *
 * import { autoRegister } from "@/core/container/auto-register";
 *
 * // ... manual bindings ...
 *
 * // Auto-register all decorated services and controllers
 * console.log("\nAuto-registering services and controllers:");
 * autoRegister(container);
 *
 * export { container };
 */

// ============================================================================
// SETUP IN APP
// ============================================================================

/**
 * In your app.ts or controllers/index.ts, use:
 *
 * import { getRegisteredControllers } from "@/core/container/auto-register";
 *
 * const controllers = getRegisteredControllers();
 * RouteLoader.loadMultipleControllers(router, controllers, container);
 *
 * OR use the new helper:
 *
 * import { initiControllersRoutesAuto } from "@/controllers/index.new";
 * app.use("/api", initiControllersRoutesAuto());
 */

// ============================================================================
// BENEFITS
// ============================================================================

/**
 * ✅ No manual registration in types.ts
 * ✅ No manual binding in container.ts
 * ✅ No manual import in controllers/index.ts
 * ✅ Just decorate and go!
 * ✅ Works with all Inversify features (inject, scope, etc.)
 * ✅ Type-safe: Symbol.for(ClassName) convention
 * ✅ Better discoverability: grep for @Service or @AutoController
 *
 * Before: 4 files to edit per service/controller
 * After: 1 file with 1 decorator
 */
