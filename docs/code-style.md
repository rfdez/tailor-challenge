# 🎯 Code Style

## 💡 Convention

The project uses `typescript-eslint` with [`strict`](https://typescript-eslint.io/users/configs#strict) and [`stylistic`](https://typescript-eslint.io/users/configs#stylistic) as the base ESLint preset. TypeScript strict mode is enabled.

Key rules enforced:

- `@typescript-eslint/explicit-function-return-type: error` — every function must declare its return type.
- TypeScript `strict: true` in `tsconfig.json`.

Lint issues are fixed with `npm run lint:fix`. The full check suite runs with `npm run prep` (format + lint + build + test).

## 🏆 Benefits

- Explicit return types make function contracts clear and catch unintended type changes at compile time.
- Strict mode eliminates entire categories of runtime bugs (null/undefined, implicit any).
- A shared preset ensures all team members and AI agents produce consistent code style.

## 👀 Examples

### ✅ Good: Function with explicit return type

```typescript
async searchAll(): Promise<RestaurantPrimitives[]> {
  const restaurants = await this.repository.searchAll();

  return restaurants.map((r) => r.toPrimitives());
}
```

### ❌ Bad: Function without return type

```typescript
async searchAll() {
  const restaurants = await this.repository.searchAll();

  return restaurants.map((r) => r.toPrimitives());
}
```

## 🧐 Real world examples

- ESLint config: `eslint.config.mjs`
- TypeScript config: `tsconfig.json`
- Use case with explicit return types: `src/modules/restaurants/application/search-all/AllRestaurantsSearcher.ts`

## 🔗 Related agreements

- [Hexagonal Architecture](backend/hexagonal-architecture.md)
