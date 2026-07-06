export class RestaurantDoesNotExistError extends Error {
  constructor(id: string) {
    super();

    this.name = "RestaurantDoesNotExistError";
    this.message = `Restaurant ${id} does not exist.`;
  }
}
