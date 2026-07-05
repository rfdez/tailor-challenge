# 🎯 Object Mothers for Testing

## 💡 Convention

Use the Object Mother pattern to instantiate entities in tests. Each entity has a corresponding `*Mother` class located in `tests/modules/{module}/domain/`. Shared mothers live in `tests/modules/shared/domain/`.

Mothers use `@faker-js/faker` for random data generation and accept an optional `Partial<Primitives>` parameter to override specific fields when needed.

## 🏆 Benefits

- Test data creation is centralized, avoiding duplication across test files.
- Tests clearly express which fields matter by overriding only relevant ones.
- Random data exposes hidden assumptions and coupling to specific values.
- Mothers evolve alongside the domain model in a single place.

## 👀 Examples

### ✅ Good: Object Mother with partial overrides

```typescript
import { faker } from "@faker-js/faker";

import {
  CookedDish,
  CookedDishPrimitives,
} from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDish";
import { IngredientMother } from "../../../shared/domain/IngredientMother";

import { CookedDishIdMother } from "./CookedDishIdMother";

export class CookedDishMother {
  static create(params?: Partial<CookedDishPrimitives>): CookedDish {
    const primitives: CookedDishPrimitives = {
      id: faker.string.uuid(),
      name: faker.food.dish(),
      description: faker.food.description(),
      ingredients: [
        {
          name: faker.food.ingredient(),
          type: "main",
        },
      ],
      ...params,
    };

    return CookedDish.fromPrimitives(primitives);
  }
}
```

### ❌ Bad: Hardcoded test data inline

```typescript
it("should create a cooked dish", async () => {
  const dish = CookedDish.create(
    "550e8400-e29b-41d4-a716-446655440000",
    "Pasta Carbonara",
    "A classic Italian dish",
    [
      { name: "Pasta", type: "main" },
      { name: "Egg", type: "main" },
    ],
  );

  await creator.create(dish);
});
```

## 🧐 Real world examples

- `tests/modules/reservations/domain/ReservationMother.ts`
- `tests/modules/restaurants/domain/RestaurantMother.ts`

## 🔗 Related agreements

- [Mock Objects for Testing](mock-objects.md)
- [Hexagonal Architecture](../backend/hexagonal-architecture.md)
