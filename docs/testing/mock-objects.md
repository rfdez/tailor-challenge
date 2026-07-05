# 🎯 Mock Objects for Testing

## 💡 Convention

Mock objects are hand-written implementations of domain interfaces (repositories, event buses, gateways) used in unit tests. They live in `tests/modules/{module}/infrastructure/` or `tests/modules/shared/infrastructure/`.

Each mock implements the corresponding domain interface and exposes `should*` methods to set up expectations, using `vi.fn()` internally for assertion. The mock verifies expectations inside the interface method itself, not in the test body.

## 🏆 Benefits

- Tests verify behavior through domain contracts, not framework-specific mock APIs.
- `should*` methods make test setup read like a specification: "the repository should save this dish".
- Mocks are reusable across all tests for the same aggregate.
- Swapping the assertion library only requires changing the mock, not every test.

## 👀 Examples

### ✅ Good: Mock implementing domain interface with should\* setup methods

```typescript
import { CookedDish } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDish";
import { CookedDishRepository } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishRepository";

export class MockCookedDishRepository implements CookedDishRepository {
  private readonly mockSave = vi.fn();
  private readonly mockSearchAll = vi.fn();

  async save(dish: CookedDish): Promise<void> {
    expect(this.mockSave).toHaveBeenCalledWith(dish.toPrimitives());

    return Promise.resolve();
  }

  shouldSave(dish: CookedDish): void {
    this.mockSave(dish.toPrimitives());
  }

  async searchAll(): Promise<CookedDish[]> {
    return this.mockSearchAll();
  }

  shouldSearchAllReturn(dishes: CookedDish[]): void {
    this.mockSearchAll.mockReturnValueOnce(dishes);
  }
}
```

### ❌ Bad: Using vi.mock() or inline mocking in tests

```typescript
import { CookedDishRepository } from "../../domain/CookedDishRepository";

vi.mock("../../infrastructure/PostgresCookedDishRepository");

it("should create a cooked dish", async () => {
  const mockRepo = {
    save: vi.fn(),
    searchAll: vi.fn(),
  } as unknown as CookedDishRepository;

  const creator = new CookedDishCreator(mockRepo);

  await creator.create("id", "name", "desc", []);

  expect(mockRepo.save).toHaveBeenCalled();
});
```

## 🧐 Real world examples

- `tests/modules/reservations/infrastructure/MockReservationRepository.ts`
- `tests/modules/restaurants/infrastructure/MockRestaurantRepository.ts`

## 🔗 Related agreements

- [Object Mothers for Testing](object-mothers.md)
- [Hexagonal Architecture](../backend/hexagonal-architecture.md)
