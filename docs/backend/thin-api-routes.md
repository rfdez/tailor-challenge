# 🎯 Thin API Routes

## 💡 Convention

API routes (`src/app/api/*.ts`) must be thin controllers. They instantiate a use case, call it, and return the response. They must not contain business logic such as filtering, sorting, mapping, or any domain rule.

All business logic belongs in the Application layer (use cases) or the Domain layer.

## 🏆 Benefits

- Business logic stays testable through unit tests against use cases, without needing HTTP infrastructure.
- API routes become trivially simple, reducing the chance of bugs in the delivery layer.
- Logic is reusable — the same use case can be called from API routes, CLI commands, or event handlers.

## 👀 Examples

### ✅ Good: Route delegates entirely to a use case

```typescript
// Import statements...

const app = new Hono();

const repository = new InMemoryCookedDishesRepository();
const searcher = new AllCookedDishesSearcher(repository);

app.get("/", async (c) => {
  const dishes = await searcher.searchAll();

  return c.json({ cookedDishes: dishes });
});

// More routes...

export default app;
```

### ❌ Bad: Business logic inside the API route

```typescript
// Import statements...

const app = new Hono();

const repository = new InMemoryCookedDishesRepository();

app.get("/", async (c) => {
  const dishes = await repository.searchAll();
  const filtered = dishes.filter((d) => d.ingredients.length > 3);
  const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));

  return c.json({ cookedDishes: sorted.map((d) => d.toPrimitives()) });
});

// More routes...

export default app;
```

## 🧐 Real world examples

- `src/app/api/reservations.ts`
- `src/app/api/restaurants.ts`

## 🔗 Related agreements

- [Hexagonal Architecture](hexagonal-architecture.md)
