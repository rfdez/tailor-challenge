# Restaurants App (Tailor Hub Technical Challenge)

A technical challenge for a Backend Engineer position at Tailor Hub. The challenge is to build a restaurants app where users can discover restaurants, manage favourites, leave comments, and create table reservations.

## Tech Stack

- Node.js 24+ with TypeScript
- Hono for API routes
- PostgreSQL for database
- Vitest for testing
- Prettier for code formatting
- ESLint for linting
- Docker for production build
- Docker Compose for infrastructure provisioning for testing

## Useful Commands

Global commands (entire codebase):

```bash
npm run build
docker compose up -d # Start database for integration tests
npm test -- run --reporter=agent # Run all tests with process exit and the agent reporter
npm run format
npm run lint:fix
```

Scoped commands (specific files or directories):

```bash
npx vitest run --reporter=agent tests/modules/merchants/infrastructure/ElasticMerchantRepository.test.ts # Run a specific test file
npx prettier --write src/modules/merchants/infrastructure/ElasticMerchantRepository.ts # Format a specific file
npx eslint --fix src/modules/merchants/infrastructure/ElasticMerchantRepository.ts # Fix linting issues in a specific file
```

## Documentation

- Detailed conventions with examples live in `docs/`.
- When working on a task, use this map to find and read **only** the docs relevant to your task:

```txt
docs/
├── backend
│   ├── api-response-envelope.md
│   ├── client-generated-ids.md
│   ├── commands-return-void.md
│   ├── cross-module-communication.md
│   ├── hexagonal-architecture.md
│   ├── search-vs-find-naming.md
│   └── thin-api-routes.md
├── code-style.md
├── documentation-guidelines.md
└── testing
    ├── mock-objects.md
    └── object-mothers.md
```
