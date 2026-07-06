# 🎯 Cross-Module Communication

## 💡 Convention

Use cases from one module must never inject a repository from another module. The entry point for cross-module communication is always a use case from the target module.

- **Same module:** injecting the module's own repository is the standard pattern.
- **Different module:** inject and call the target module's use case instead of its repository.

This keeps domain boundaries intact and prevents infrastructure-level coupling between modules.

## 🏆 Benefits

- Module boundaries stay clean — each module owns its data access.
- Cross-module dependencies are explicit at the application layer, making the architecture easier to reason about.
- Changes to a module's repository (e.g. switching from Postgres to in-memory) do not propagate to other modules.
- Use cases remain the single point of entry for business operations, including reads that may throw domain errors (e.g. `RestaurantDoesNotExistError`).

## 👀 Examples

### ✅ Good: Cross-module — injecting the use case

```typescript
import { RestaurantFinder } from "../../../restaurants/application/find/RestaurantFinder.js";
import { ReservationRepository } from "../../domain/ReservationRepository.js";

export class AvailabilitySearcher {
  constructor(
    private readonly restaurantFinder: RestaurantFinder, // use case from restaurants module
    private readonly reservationRepository: ReservationRepository, // same module's repository
  ) {}

  async search(
    restaurantId: string,
    date: string,
    partySize: number,
  ): Promise<Slot[]> {
    const restaurant = await this.restaurantFinder.find(restaurantId);
    // ...
  }
}
```

### ✅ Good: Same module — injecting the repository

```typescript
import { ReservationRepository } from "../../domain/ReservationRepository.js";

export class ReservationsByRestaurantAndDateSearcher {
  constructor(private readonly repository: ReservationRepository) {}

  async search(
    restaurantId: string,
    date: string,
  ): Promise<ReservationPrimitives[]> {
    const reservations = await this.repository.searchByRestaurantAndDate(
      restaurantId,
      date,
    );
    // ...
  }
}
```

### ❌ Bad: Injecting a repository from another module

```typescript
import { RestaurantRepository } from "../../../restaurants/domain/RestaurantRepository.js";
import { ReservationRepository } from "../../domain/ReservationRepository.js";

export class AvailabilitySearcher {
  constructor(
    private readonly restaurantRepository: RestaurantRepository, // wrong: cross-module repository
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async search(
    restaurantId: string,
    date: string,
    partySize: number,
  ): Promise<Slot[]> {
    const restaurant = await this.restaurantRepository.search(restaurantId);
    if (!restaurant) throw new RestaurantDoesNotExistError(restaurantId);
    // ...
  }
}
```

## 🧐 Real world examples

- Cross-module via use case: `src/modules/reservations/application/search-availability/AvailabilitySearcher.ts:8` — injects `RestaurantFinder`
- Same-module via repository: `src/modules/reservations/application/search-by-restaurant-and-date/ReservationsByRestaurantAndDateSearcher.ts:5` — injects `ReservationRepository`
- Same-module via repository: `src/modules/reservations/application/create/ReservationCreator.ts:7` — injects `ReservationRepository`

## 🔗 Related agreements

- [Hexagonal Architecture](hexagonal-architecture.md)
- [Search vs. Find Naming](search-vs-find-naming.md)
- [Thin API Routes](thin-api-routes.md)
