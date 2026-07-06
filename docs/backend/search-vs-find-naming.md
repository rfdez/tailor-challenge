# 🎯 Search vs. Find Naming Convention

## 💡 Convention

Use **`search`** for repository methods that may or may not locate an entity, returning `T | null` without throwing exceptions. Use **`find`** for use case methods that are expected to always succeed, throwing a domain error when the entity does not exist.

- **Repositories** (`domain/` and `infrastructure/`): Methods start with `search`. They return `Entity | null` and never throw. The infrastructure enriches the repository to store data, not to enforce business rules.
- **Use cases** (`application/`): Methods start with `find` when the caller expects a result to exist. If the repository returns `null`, the use case throws a domain-specific error.

This keeps business logic (what constitutes a "not found" error) inside the application layer, while repositories remain simple data-access ports.

## 🏆 Benefits

- Method names alone communicate whether `null` is a valid return value or an error condition.
- Repositories stay focused on data access without embedding business decisions (e.g., which `null` cases are errors).
- Use cases encapsulate the decision of when "not found" becomes a domain error, keeping that logic testable in isolation.
- Consistent naming across modules makes the codebase predictable for both developers and AI agents.

## 👀 Examples

### ✅ Good: Repository uses `search`, use case uses `find`

```typescript
// Repository port (domain)
export abstract class RestaurantRepository {
  abstract search(id: string): Promise<Restaurant | null>;
}

// Repository implementation (infrastructure)
export class PostgresRestaurantRepository implements RestaurantRepository {
  async search(id: string): Promise<Restaurant | null> {
    const row = await this.connection.searchOne<DatabaseRestaurant>`
      SELECT * FROM restaurants WHERE id = ${id};
    `;

    if (row === null) return null;

    return Restaurant.fromPrimitives({/* mapping */});
  }
}

// Use case (application)
export class RestaurantFinder {
  constructor(private readonly repository: RestaurantRepository) {}

  async find(id: string): Promise<RestaurantPrimitives> {
    const restaurant = await this.repository.search(id);

    if (restaurant === null) {
      throw new RestaurantDoesNotExistError(id);
    }

    return restaurant.toPrimitives();
  }
}
```

### ❌ Bad: Repository throws, or use case returns null

```typescript
// Repository throwing an error — business logic leaked into infrastructure
export abstract class RestaurantRepository {
  abstract find(id: string): Promise<Restaurant>; // throws if not found
}

// Use case returning null — caller ambiguity
export class RestaurantFinder {
  async find(id: string): Promise<RestaurantPrimitives | null> {
    // ... returns null when not found
  }
}
```

## 🧐 Real world examples

- Repository port: `src/modules/restaurants/domain/RestaurantRepository.ts:5` (`search` and `searchAll`)
- Repository implementation: `src/modules/restaurants/infrastructure/PostgresRestaurantRepository.ts:40` (`search`)
- Use case: `src/modules/restaurants/application/find/RestaurantFinder.ts:9` (`find`)
- Domain error: `src/modules/restaurants/domain/RestaurantDoesNotExistError.ts`

## 🔗 Related agreements

- [Hexagonal Architecture](./hexagonal-architecture.md)
- [Code Style](../code-style.md)
