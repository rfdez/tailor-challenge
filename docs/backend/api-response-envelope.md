# 🎯 API Response Envelope

## 💡 Convention

Every HTTP endpoint must return its data wrapped in an object with a named key that identifies the resource. Collections use the plural form of the resource name, single entities use the singular form.

This provides an envelope that can be extended with metadata (pagination, timestamps, links, etc.) without changing the contract for existing clients.

## 🏆 Benefits

- The API contract becomes resilient to evolution — new fields like `total`, `page`, or `next` can be added at the top level alongside the existing key without breaking consumers.
- Consumers always destructure from a known key rather than guessing the shape of the response.
- Consistent response shape across the entire API surface simplifies client code and code generation.

## 👀 Examples

### ✅ Good: Collection wrapped in a plural key

```typescript
app.get("/", sValidator("query", byIdsQuerySchema), async (c) => {
  const restaurants = await byIdsSearcher.search(c.req.valid("query").ids);
  return c.json({ restaurants });
});
```

### ✅ Good: Single entity wrapped in a singular key

```typescript
app.get("/:id", async (c) => {
  const restaurant = await searcher.search(c.req.param("id"));
  if (!restaurant) return c.notFound();
  return c.json({ restaurant });
});
```

### ❌ Bad: Returning the data directly

```typescript
app.get("/", async (c) => {
  const restaurants = await searcher.searchAll();
  return c.json(restaurants); // Clients receive a bare array — no room for metadata
});
```

### ❌ Bad: Returning a single object directly

```typescript
app.get("/:id", async (c) => {
  const restaurant = await searcher.search(c.req.param("id"));
  return c.json(restaurant); // Clients receive a bare object — no room for metadata
});
```

### ❌ Bad: Generic wrapper key

```typescript
app.get("/", async (c) => {
  const restaurants = await searcher.searchAll();
  return c.json({ data: restaurants }); // Key must match the resource name
});
```

## 🧐 Real world examples

- `src/app/api/restaurants.ts` — wraps in `{ restaurants }` / `{ restaurant }`

## 🔗 Related agreements

- [Thin API Routes](thin-api-routes.md) — route handlers should be thin controllers that delegate to use cases and return the response envelope
