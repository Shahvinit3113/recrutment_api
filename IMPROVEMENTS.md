# API Improvements Summary

This document outlines the improvements made to address the identified limitations and enhance the developer experience.

## Issues Addressed

### 1. ✅ Different Response Types (getById vs getList)

**Problem:** `getById` and `getList` returned the same `TResult` type but with different structures.

**Solution:** Created distinct response types in [response.ts](src/data/response/response.ts):

```typescript
// For single entity responses
SingleResult<T>; // { Data: T | null }

// For paginated list responses
PagedListResult<T>; // { Data: T[], Pagination: PaginationInfo }

// Helper factory
ApiResponse.single(user); // Single entity
ApiResponse.paged(users, page, limit, total); // Paginated list
```

---

### 2. ✅ Request Body Validation

**Problem:** No validation logic for `req.body` data.

**Solution:** Created Zod-based validation decorators in [schema-validation.decorator.ts](src/core/decorators/schema-validation.decorator.ts):

```typescript
// Define schema
const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
});

// Use decorator
@ValidateBodySchema(CreateUserSchema)
async create(req: BodyRequest<z.infer<typeof CreateUserSchema>>, res: Response) {
  // req.body is fully typed and validated!
}
```

Common schemas available in [schemas.ts](src/core/validation/schemas.ts).

---

### 3. ✅ Seed Data System

**Problem:** No logic for adding and running seeds.

**Solution:** Created a complete seed system in [src/db/seeds/](src/db/seeds/):

```bash
# Run all pending seeders
npm run seed

# Check status
npm run seed:status

# Rollback last batch
npm run seed:rollback
```

Create new seeders by extending the `Seeder` class:

```typescript
export class MySeeder extends Seeder {
  name = "MySeeder";
  order = 10;

  async run(db: DatabaseConnection): Promise<void> {
    await db.execute("INSERT INTO ...", [...]);
  }
}
```

---

### 4. ✅ Database Transactions

**Problem:** No transaction support in services for rollback on errors.

**Solution:** Created Unit of Work pattern in [unit-of-work.ts](src/db/connection/unit-of-work.ts):

```typescript
@inject(TYPES.UnitOfWork) private unitOfWork: UnitOfWork;

async createUserWithProfile(data: CreateUserDto): Promise<User> {
  return this.unitOfWork.withTransaction(async (uow) => {
    // All queries use same connection
    await uow.execute("INSERT INTO User ...", [...]);
    await uow.execute("INSERT INTO Profile ...", [...]);

    return user;
    // Auto-commits on success, auto-rollback on error
  });
}

// Or use decorator
@Transactional()
async myMethod() { ... }
```

---

### 5. ✅ Confusing Express Types

**Problem:** Generic parameters for `Request<Params, ResBody, ReqBody, Query>` are hard to remember.

**Solution:** Created intuitive typed helpers in [express.types.ts](src/core/types/express.types.ts):

```typescript
// Instead of confusing:
Request<{ id: string }, any, CreateUserDto, any>;

// Use clear named types:
BodyRequest<CreateUserDto>; // Just body
ParamsRequest<{ id: string }>; // Just params
ParamsBodyRequest<{ id: string }, UpdateDto>; // Params + body

// Or fully typed:
TypedRequest<{
  params: { id: string };
  body: UpdateDto;
  query: { include?: string };
}>;
```

---

### 6. ✅ Manual Container Registration

**Problem:** Had to add to 4 places: service, controller, types.ts, container.ts, index.ts

**Solution:** Created auto-registration decorators in [auto-register.ts](src/core/container/auto-register.ts):

```typescript
// Just decorate your service
@Service({ scope: "request" })
export class UserService { ... }

// And controller
@AutoController("/users")
export class UserController { ... }

// Then in container setup:
autoRegister(container);

// Routes auto-discovered:
initiControllersRoutesAuto();
```

---

## Additional Issues Fixed

### 7. ✅ CallerService Race Condition

**Problem:** `CallerService` was singleton but stored per-request data, causing data leakage between concurrent requests.

**Solution:** Created `AsyncLocalStorage`-based request context in [request-context.ts](src/core/context/request-context.ts):

```typescript
// Now thread-safe
import { requestContext } from "@/core/context/request-context";

requestContext.userId; // Current request's user ID
requestContext.tenantId; // Current request's tenant ID
```

---

### 8. ✅ ValidationError Wrong Status Code

**Problem:** `ValidationError` returned HTTP 404 instead of 400.

**Solution:** Fixed in [validation.error.ts](src/middleware/errors/validation.error.ts):

```typescript
readonly StatusCode: number = 400; // Was 404
```

---

### 9. ✅ Filename Typo

**Problem:** `unauthorized.error..ts` had double dots.

**Solution:** Created [unauthorized.error.ts](src/middleware/errors/unauthorized.error.ts) with correct name and updated all imports.

---

### 10. ✅ Proper Pagination

**Problem:** Pagination was hardcoded to `(1, 1, 1)`.

**Solution:** Added real pagination support:

```typescript
// In filter.ts
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// In repository
async getAllPaginated(
  tenantId: string,
  pagination: PaginationParams
): Promise<PaginatedData<T>>
```

---

## New Files Created

| File                                                 | Purpose                                 |
| ---------------------------------------------------- | --------------------------------------- |
| `src/core/context/request-context.ts`                | AsyncLocalStorage-based request context |
| `src/core/types/express.types.ts`                    | Typed Express request/response helpers  |
| `src/core/decorators/schema-validation.decorator.ts` | Zod-based validation decorators         |
| `src/core/validation/schemas.ts`                     | Reusable validation schemas             |
| `src/core/container/auto-register.ts`                | Auto-registration decorators            |
| `src/db/connection/unit-of-work.ts`                  | Transaction management                  |
| `src/db/seeds/seeder.ts`                             | Seeder base class and manager           |
| `src/db/seeds/index.ts`                              | Seeder registry                         |
| `src/db/seeds/run-seeds.ts`                          | CLI runner                              |
| `src/db/seeds/seeders/001-admin-user.seeder.ts`      | Example seeder                          |
| `src/middleware/implementation/requestContext.ts`    | Request context middleware              |

---

## Migration Guide

### Step 1: Update Container Setup

```typescript
import { autoRegister } from "@/core/container/auto-register";

// After manual bindings...
autoRegister(container);
```

### Step 2: Add Request Context Middleware

In `app.ts`, add `requestContextMiddleware` as the first middleware.

### Step 3: Update Controllers to Use Validation

```typescript
import { ValidateBodySchema } from "@/core/decorators/schema-validation.decorator";
import { CreateUserSchema } from "@/core/validation/schemas";

@ValidateBodySchema(CreateUserSchema)
@Post("/")
async create(req: BodyRequest<CreateUserDto>, res: Response) { ... }
```

### Step 4: Use New Response Types

```typescript
import {
  ApiResponse,
  SingleResult,
  PagedListResult,
} from "@/data/response/response";

// Single entity
return res.send(ApiResponse.single(user));

// Paginated list
return res.send(ApiResponse.paged(users, page, limit, total));
```

---

## Dependencies Added

```bash
npm install zod
```
