# tailor-challenge

A restaurants discovery and table reservation HTTP API, built as a technical challenge for Tailor Hub.

## Features

- **Restaurant discovery** -- list all restaurants and check table availability by date and party size.
- **Table reservations** -- create confirmed reservations with business-rule validation (party size, date, time slot, and seat capacity).
- **Interactive API docs** -- Swagger UI at `/docs` with auto-generated OpenAPI spec at `/openapi.json`.
- **Health check** -- `GET /ping` for readiness probes.

## Tech Stack

| Component  | Technology                 |
| ---------- | -------------------------- |
| Runtime    | Node.js 24+                |
| Language   | TypeScript 6 (strict mode) |
| Framework  | Hono 4                     |
| Validation | Zod 4                      |
| API Docs   | hono-openapi + Swagger UI  |
| Database   | PostgreSQL 18              |
| Testing    | Vitest                     |
| Linting    | ESLint + Prettier          |

The codebase follows [Hexagonal Architecture](docs/backend/hexagonal-architecture.md) with three layers: domain, application, and infrastructure.

## Getting Started

### Prerequisites

- Node.js 24.18.0 (see `.node-version`; install with `nvm use` or `fnm use`)
- npm >= 11.3.0
- Docker and Docker Compose

### Setup

```bash
npm ci
docker compose up -d
npm run db:seed
npm run dev
```

The server starts at `http://localhost:8080`. Visit `http://localhost:8080/docs` for the interactive API documentation.

### Environment Variables

All variables are optional and have defaults suitable for local development.

| Variable       | Default                                                         | Description                                       |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| `HOST`         | `localhost`                                                     | Server host                                       |
| `PORT`         | `8080`                                                          | Server port                                       |
| `NODE_ENV`     | `development`                                                   | Environment (`development`, `production`, `test`) |
| `DATABASE_URL` | `postgresql://restaurants:S3cureP@ssw0rd@localhost/restaurants` | PostgreSQL connection string                      |

### Scripts

| Script                  | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Start in development mode with hot reload |
| `npm run build`         | Compile TypeScript to `dist/`             |
| `npm start`             | Run the compiled build                    |
| `npm run db:seed`       | Seed the database with sample data        |
| `npm test`              | Run tests (watch mode)                    |
| `npm run test:ci`       | Run tests tagged with `ci`                |
| `npm run test:coverage` | Run tests with coverage report            |
| `npm run format`        | Format code with Prettier                 |
| `npm run format:check`  | Check formatting without writing changes  |
| `npm run lint`          | Lint all files                            |
| `npm run lint:fix`      | Auto-fix linting issues                   |
| `npm run prep`          | Full check (format, lint, build, test)    |
| `npm run clean`         | Remove `dist/` and `coverage/`            |

## API Reference

All endpoints return JSON wrapped in a named response key per the [API response envelope](docs/backend/api-response-envelope.md) convention.

### Health & Docs

**`GET /`** -- Redirects to `/docs`.

**`GET /ping`** -- Returns `pong` (plain text).

**`GET /docs`** -- Interactive Swagger UI documentation.

**`GET /openapi.json`** -- Auto-generated OpenAPI 3.0 specification.

### Restaurants

**`GET /restaurants`** -- List all restaurants.

Response: `200 OK`

```json
{
  "restaurants": [
    {
      "id": "uuid",
      "name": "Mission Chinese Food",
      "description": "...",
      "address": "171 E Broadway, New York, NY 10002",
      "imageUrl": "https://...",
      "coordinates": { "lat": 40.7139, "lng": -73.9879 },
      "rating": 4.8,
      "commentsCounter": 5,
      "cuisineType": "Chinese",
      "capacity": 80,
      "reservationSettings": {
        "serviceWindows": [
          { "name": "dinner", "start": "17:00", "end": "22:00" }
        ],
        "slotIntervalMinutes": 30,
        "defaultSlotCapacity": 20
      }
    }
  ]
}
```

**`GET /restaurants/:restaurantId/availability?date=YYYY-MM-DD&partySize=N`** -- Get available time slots for a restaurant on a given date.

Response: `200 OK`

```json
{
  "slots": [
    {
      "time": "17:00",
      "capacity": 20,
      "reservedSeats": 0,
      "availableSeats": 20,
      "available": true
    }
  ]
}
```

Errors: `404 Not Found` if the restaurant does not exist.

### Reservations

**`PUT /reservations/:id`** -- Create a reservation with a client-provided UUID. Requires `x-anonymous-user-id` header.

Request body:

```json
{
  "restaurantId": "uuid",
  "date": "2026-08-15",
  "time": "19:00",
  "partySize": 4
}
```

Response: `201 Created` with `Location` header.

Errors:

- `400 Bad Request` -- invalid party size, past date, invalid time slot, or insufficient available seats.
- `401 Unauthorized` -- missing `x-anonymous-user-id` header.
- `404 Not Found` -- restaurant does not exist.

## Middleware

The Hono app applies the following middleware globally:

- `hono/logger` -- request logging
- `hono/request-id` -- auto-generated request IDs
- `hono/secure-headers` -- security response headers (CSP, HSTS, etc.)

## Project Structure

```text
src/
├── app/
│   ├── api/              # HTTP route handlers (thin controllers)
│   └── app.ts            # Hono app assembly and middleware
├── index.ts              # Server entry point
└── modules/
    ├── restaurants/      # Restaurant domain module
    │   ├── application/
    │   │   ├── find/     # RestaurantFinder use case
    │   │   └── search-all/  # AllRestaurantsSearcher use case
    │   ├── domain/       # Entities, repository interface, errors
    │   └── infrastructure/  # PostgresRestaurantRepository
    ├── reservations/     # Reservations domain module
    │   ├── application/
    │   │   ├── create/              # ReservationCreator use case
    │   │   ├── search-availability/ # AvailabilitySearcher use case
    │   │   └── search-by-restaurant-and-date/  # ReservationsByRestaurantAndDateSearcher use case
    │   ├── domain/       # Entities, availability calculator, errors
    │   └── infrastructure/  # PostgresReservationRepository
    └── shared/           # Cross-cutting concerns
        ├── domain/       # Clock abstraction
        └── infrastructure/  # DB connection, system clock, config

tests/                    # Mirrors src/ structure, nested per use case
databases/                # SQL migration files
etc/
├── scripts/              # Seed data and seed script
└── request/              # HTTP request files for manual testing
```

## Architecture Conventions

These conventions are documented in detail under `docs/`:

- **Hexagonal Architecture** -- domain, application, and infrastructure layers with strict dependency rules.
- **Thin API Routes** -- route handlers instantiate and invoke use cases; no business logic in routes.
- **Commands Return Void** -- mutating use cases return `void` and throw domain errors on failure.
- **Client-Generated IDs** -- reservations use UUIDs provided by the client via `PUT`.
- **Search vs. Find Naming** -- repository `search` methods return `T | null`; use case `find` methods throw a domain error when the entity is not found.
- **Cross-Module Communication** -- modules communicate through use cases, never by injecting another module's repository.
- **API Response Envelope** -- all JSON responses wrap data in a named key (e.g. `{ restaurants: [...] }`).

## Testing

Tests use Vitest with serial execution (`fileParallelism: false` to avoid DB conflicts) and are organized in four layers:

| Layer                        | Location                          | Requires DB | Example                                 |
| ---------------------------- | --------------------------------- | ----------- | --------------------------------------- |
| Domain (unit)                | `tests/modules/*/domain/`         | No          | `AvailabilityCalculator.test.ts`        |
| Application (unit)           | `tests/modules/*/application/*/`  | No          | `RestaurantFinder.test.ts`              |
| Infrastructure (integration) | `tests/modules/*/infrastructure/` | Yes         | `PostgresReservationRepository.test.ts` |
| API (integration)            | `tests/app/api/`                  | Yes         | `RestaurantsGet.test.ts`                |

Before running integration tests, start the database:

```bash
docker compose up -d
npm test -- run
```

Run a single test file:

```bash
npx vitest run tests/modules/restaurants/infrastructure/PostgresRestaurantRepository.test.ts
```

Tests tagged with `ci` are run in CI environments via `npm run test:ci`.

### Test helpers

- **Object Mothers** (`*Mother.ts`) create test entities with randomized data via Faker, accepting partial overrides.
- **Mock Repositories** (`Mock*Repository.ts`) are hand-written implementations of repository interfaces using `vi.fn()` with `should*` setup methods.
- **MockClock** fakes the `Clock` abstraction for deterministic date-based tests.

See the [testing documentation](docs/testing/) for detailed conventions.

### Manual testing

HTTP request files in `etc/request/` can be used with REST Client extensions (VS Code, IntelliJ) to manually test endpoints:

- `etc/request/restaurants.http` -- GET all restaurants and GET availability
- `etc/request/reservations.http` -- PUT create reservation with dynamic UUID

## CI

GitHub Actions runs on every push to `main` and on all pull requests (see `.github/workflows/ci.yml`):

| Job            | Steps                                   |
| -------------- | --------------------------------------- |
| Lint           | `npm run lint` + `npm run format:check` |
| Test and build | `npm run build` + `npm run test:ci`     |

Dependabot is configured for monthly npm and GitHub Actions updates (see `.github/dependabot.yml`).

## Contributing

1. Read `AGENTS.md` and the relevant docs under `docs/` for the area you are working on.
2. Create a branch from `main`.
3. Write or update tests to cover your changes.
4. Run `npm run prep` before pushing to ensure formatting, linting, build, and tests all pass.
5. Open a pull request against `main`.
