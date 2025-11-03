# Recruitment API (Node.js + TypeScript)

A modular, production-grade REST API for managing gyms and users. Built with Express, TypeScript, InversifyJS (DI), MySQL2, and structured into clean layers (controllers → services → repositories → queries) with request-scoped dependency injection and standardized responses.

## Features

- **TypeScript-first** with strict types and layered architecture
- **InversifyJS DI** with request-scoped container via middleware
- **MySQL2** connection pool and composable SQL query builders
- **Generic CRUD** utilities to wire controllers rapidly
- **JWT-based auth hooks** (middleware and caller context service)
- **Security middleware**: Helmet, CORS, Rate limiting, Compression
- **Structured logging** via Winston
- **Standard response envelope** and error handling
- **Environment-specific config** with `.env.<env>` support

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL (or compatible) instance

### Install

```bash
npm install
```

### Environment

The app loads `./.env.<NODE_ENV>` first, falling back to `./.env`.

Required env vars (see `src/core/config/environment.ts`):

```
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gym_db
DB_CONNECTION_LIMIT=10

# Optional / Security
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=supersecret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ALGORITHM=HS256

BCRYPT_ROUNDS=12
BCRYPT_ALGORITHM=aes-256-gcm

# Uploads / CORS / Rate limit
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,video/mp4
CORS_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Scripts

```bash
# Dev (tsx watch)
npm run dev

# Build to dist/
npm run build

# Start built app
npm start

# Lint
npm run lint
npm run lint:fix

# Tests (placeholder)
npm test
```

## Run

1. Create `.env.development` (or `.env`) with values above
2. Ensure DB exists and tables for `User` and `Gym` are present
3. Dev server: `npm run dev` → http://localhost:3000

Health endpoints:

- `GET /health` → `{ status: "ok" }`
- `GET /ready` → `{ ready: true }`

## Project Structure

```
src/
  app.ts                  # Express app bootstrap
  server/                 # Server start/shutdown and process handlers
  routes/                 # Route registration + CRUD route helpers
  controllers/            # Controllers (mostly thin, generic)
  service/                # Business logic (VmService + concrete services)
  repository/             # DB repositories (generic + implementations)
  db/                     # MySQL connection + SQL query builders
  core/                   # Config, DI container, helpers
  middleware/             # Security, DI scope, auth, errors, logging
  data/                   # Entities, enums, filters, response models
```

Key entrypoint:

- `src/app.ts` wires middleware, routes, 404 + error handler, and starts server via `src/server/index.ts`.

## Architecture Overview

- **Controllers**: Thin wrappers extending a generic `BaseController`, exposing `getAll`, `getById`, `create`, `update`, `delete`.

  - Example: `UserController`, `GymController`.

- **Services**: Business logic built on `VmService<TVm,T,F,TResult>`.

  - Provides validation hooks and lifecycle hooks (`preAdd`, `postAdd`, `preUpdate`, `postUpdate`).
  - Uses `CallerService` (request-scoped) to stamp audit fields.

- **Repositories**: Generic `Respository<T>` (CRUD) backed by `BaseQueries<T>` for SQL generation.

  - Implementations (`UserRepository`, `GymRepository`) supply entity-specific queries.

- **Queries**: `BaseQueries<T>` composes SQL with soft-delete semantics and tenant support placeholders.

  - `UserQueries`, `GymQueries` pass table name constants from `db/helper/table`.

- **DI Container**: `core/container/container.ts` binds DB, repositories, services, controllers.

  - Request-scope is created per request in `middleware/implementation/diScope.ts` and augments with `CallerService`.

- **Middleware**:

  - Security: `helmet`, `compression`, `cors`, `express-rate-limit`
  - Parsing: `express.json`, `express.urlencoded`
  - Observability: `requestLogger`
  - DI scope: `diScope` attaches a child container to `req`
  - Errors: `notFound`, `errorHandler`
  - Auth: `authenticate` (decodes JWT and populates `CallerService`)

- **Responses**:
  - Standard envelope: `data/response/response.ts` → `Response<T>` with `{ IsSuccess, Status, Message, Model }`.
  - `Result<T>` and `PagedResult<T>` helpers for entity vs paged responses.

## Dependency Injection (Inversify)

- Root container (`core/container/container.ts`) registers singletons for DB and repos; services/controllers are request-scoped.
- Per-request container (`diScope`) sets parent = root and binds a fresh `CallerService` for isolation.
- Controllers are resolved per request by `withController` using `req.container`.

## Database Layer

- Connection pool via `mysql2/promise` in `db/connection/connection.ts`.
- `Respository<T>` implements CRUD using SQL strings from `BaseQueries<T>`.
- `BaseQueries<T>` builds statements: `getAll`, `getById`, `create`, `update`, `softDelete`, `hardDelete`, bulk variants.
- Soft delete pattern uses `IsDeleted` and timestamp fields; audit fields exist on `BaseEntities`.

Note: Some queries include placeholders for `TenantId`; ensure your schema and call sites provide it (or adapt queries accordingly).

## Authentication & Caller Context

- `authenticate` middleware extracts Bearer token, validates via `JWT.decode`, and sets caller on `CallerService` using the per-request container.
- `CallerService` exposes `UserId`, `Email`, `Role` and defaults to `Unknown` when not set.
- Services use `CallerService` to stamp audit fields on create/update.

## Routes & Endpoints

### Registration

`src/routes/index.ts`:

- `/` → health/ready
- `/api/users` → `user.routes.ts`
- `/api/gyms` → `gym.routes.ts`

### Generic CRUD (via `attachCrudRoutes`)

Base paths use controller tokens:

- Users: `/api/users`
- Gyms: `/api/gyms`

Endpoints provided per resource:

- `GET /all` → list all
- `GET /:id` → get by id
- `POST /` → create
- `PUT /:id` → update
- `DELETE /:id` → soft delete

Example request/response envelope:

```http
GET /api/gyms/all
200 OK
{
  "IsSuccess": true,
  "Status": 200,
  "Message": "Success",
  "Model": [
    {
      "Uid": "...",
      "Name": "Downtown Gym",
      "IsActive": true,
      "IsDeleted": false,
      "CreatedOn": "2025-09-17T10:00:00.000Z",
      "CreatedBy": "user-123",
      "UpdatedOn": null,
      "UpdatedBy": null,
      "DeletedOn": null,
      "DeletedBy": null,
      "Address": "...",
      "Phone": "...",
      "Email": "...",
      "Description": "..."
    }
  ]
}
```

## Entities

- Base fields (see `data/entities/base-entities.ts`):
  - `Uid`, `IsActive`, `IsDeleted`, `CreatedOn`, `CreatedBy`, `UpdatedOn`, `UpdatedBy`, `DeletedOn`, `DeletedBy`
- `User`: `Role`, `Password`, `Email`
- `Gym`: `Name`, `Address`, `Phone`, `Email`, `Description?`, `IsActive`

## Error Handling

- Central handler maps custom errors to status codes: `ValidationError`, `InternalServerError`, `UnAuthorizedError`; defaults to 500.
- 404s are routed through `notFound` middleware.

## Development Notes

- Ensure your tables and columns match entity fields used by `BaseQueries` and repositories.
- `VmService.toEntity` copies only matching properties from the view model to entity class instance by name.
- If using multi-tenant data (`TenantId`), extend queries and repositories accordingly to bind tenant context.
- Add validation inside `validateAdd` / `validateUpdate` overrides in concrete services when needed.

## Build & Deploy

- `npm run build` compiles TypeScript to `dist/`
- `npm start` runs the compiled output with `NODE_ENV=production`
- Graceful shutdown hooks close DB pool and HTTP server on `SIGINT`/`SIGTERM` and on unhandled exceptions rejections

## License

MIT
