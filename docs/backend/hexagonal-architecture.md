# 🎯 Hexagonal Architecture

## 💡 Convention

The backend follows Hexagonal Architecture. Code is organized in three layers:

- **Domain** — Domain Entities, Repository interfaces. No framework dependencies.
- **Application** — One use case per class. Orchestrates domain objects.
- **Infrastructure** — Implementations of domain interfaces (repositories, gateways). Framework and library aware.

Directory structure:

```txt
src/modules/
  {module}/
    application/     # Use cases (one per folder)
      {use-case}/
    domain/          # Domain entities, repository interfaces
    infrastructure/  # Repository impls, gateways
```

## 🏆 Benefits

- Domain logic stays framework-agnostic and independently testable.
- Swapping infrastructure (e.g. database, external API) requires no domain or application changes.
- One use case per class keeps application services small, focused, and easy to name.
- Folder structure mirrors the architecture, making navigation predictable.

## 👀 Examples

### ✅ Good: Use case with single responsibility

```typescript
import { CookedDishPrimitives } from "../../domain/CookedDish";
import { CookedDishRepository } from "../../domain/CookedDishRepository";

export class AllCookedDishesSearcher {
  constructor(private readonly repository: CookedDishRepository) {}

  async searchAll(): Promise<CookedDishPrimitives[]> {
    const dishes = await this.repository.searchAll();

    return dishes.map((dish) => dish.toPrimitives());
  }
}
```

### ❌ Bad: Use case that depends on infrastructure directly

```typescript
import { PostgresConnection } from "../../../shared/infrastructure/postgres/PostgresConnection";

export class AllCookedDishesSearcher {
  constructor(private readonly connection: PostgresConnection) {}

  async searchAll(): Promise<CookedDishPrimitives[]> {
    const rows = await this.connection.query("SELECT * FROM cooked_dishes");

    return rows;
  }
}
```

## 🧐 Real world examples

- Domain Entity: `src/modules/reservations/domain/Reservation.ts`
- Domain repository interface: `src/modules/reservations/domain/ReservationRepository.ts`
- Application use case: `src/modules/reservations/application/create/ReservationCreator.ts`
- Application use case: `src/modules/restaurants/application/search-all/AllRestaurantsSearcher.ts`
- Infrastructure repository: `src/modules/restaurants/infrastructure/PostgresRestaurantRepository.ts`

## 🔗 Related agreements

- [Object Mothers for Testing](../testing/object-mothers.md)
- [Mock Objects for Testing](../testing/mock-objects.md)
