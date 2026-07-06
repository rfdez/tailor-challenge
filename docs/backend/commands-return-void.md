# 🎯 Commands Return Void

## 💡 Convention

Use cases that produce side effects — creating, updating, or deleting resources — must return `void`. They must not return data about the resource they just mutated.

- **Commands** (side effects): `create`, `update`, `cancel`, `delete` → `Promise<void>`
- **Queries** (read-only): `search`, `find` → `Promise<Primitives[]>` or `Promise<Primitives>`

This keeps the intent explicit: a command mutates state; a query reads it. Mixing both in a single use case violates the single-responsibility principle and makes callers ambiguous about whether the return value reflects the mutated state or the pre-existing one.

## 🏆 Benefits

- **Clear separation of concerns:** the use case name alone tells you whether it has side effects.
- **Prevents overloaded use cases:** a `create` method that also returns data encourages callers to use the response as a replacement for a separate query, coupling the API response shape to the domain's internal write model.
- **API routes stay thin:** the route handler calls the command and returns whatever response contract it needs (e.g. `201` + `Location` header) without leaking domain structure through the use case return type.
- **Easier reasoning:** you never have to ask "does this returned object reflect the state before or after the mutation?"

## 👀 Examples

### ✅ Good: Command returns void

```typescript
export class ReservationCreator {
  async create(
    id: string,
    restaurantId: string,
    userId: string,
    date: string,
    time: string,
    partySize: number,
  ): Promise<void> {
    const reservation = Reservation.create(id, restaurantId, userId, date, time, partySize, this.clock);
    // ...validations...
    await this.repository.save(reservation);
  }
}
```

### ✅ Good: Query returns data

```typescript
export class AllRestaurantsSearcher {
  async searchAll(): Promise<RestaurantPrimitives[]> {
    const restaurants = await this.repository.searchAll();
    return restaurants.map((restaurant) => restaurant.toPrimitives());
  }
}
```

### ❌ Bad: Command returns data

```typescript
export class ReservationCreator {
  async create(...): Promise<ReservationPrimitives> {
    const reservation = Reservation.create(id, restaurantId, userId, date, time, partySize, this.clock);
    // ...
    await this.repository.save(reservation);
    return reservation.toPrimitives();   // mixing side effect with query
  }
}
```

## 🧐 Real world examples

- Command: `src/modules/reservations/application/create/ReservationCreator.ts:24` — returns `Promise<void>`
- Query: `src/modules/restaurants/application/search-all/AllRestaurantsSearcher.ts:7` — returns `Promise<RestaurantPrimitives[]>`
- Query: `src/modules/reservations/application/search-availability/AvailabilitySearcher.ts:14` — returns `Promise<Slot[]>`
- Query: `src/modules/reservations/application/search-by-restaurant-and-date/ReservationsByRestaurantAndDateSearcher.ts:7` — returns `Promise<ReservationPrimitives[]>`

## 🔗 Related agreements

- [Hexagonal Architecture](hexagonal-architecture.md)
- [Search vs. Find Naming](search-vs-find-naming.md)
- [Cross-Module Communication](cross-module-communication.md)
