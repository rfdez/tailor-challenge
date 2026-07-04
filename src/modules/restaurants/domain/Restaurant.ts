export interface RestaurantPrimitives {
  id: string;
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  commentsCounter: number;
}

export class Restaurant {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly description: string,
    private readonly address: string,
    private readonly imageUrl: string,
    private readonly coordinates: { lat: number; lng: number },
    private readonly rating: number,
    private readonly commentsCounter: number,
  ) {}

  static fromPrimitives(primitives: RestaurantPrimitives): Restaurant {
    return new Restaurant(
      primitives.id,
      primitives.name,
      primitives.description,
      primitives.address,
      primitives.imageUrl,
      primitives.coordinates,
      primitives.rating,
      primitives.commentsCounter,
    );
  }

  toPrimitives(): RestaurantPrimitives {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      address: this.address,
      imageUrl: this.imageUrl,
      coordinates: this.coordinates,
      rating: this.rating,
      commentsCounter: this.commentsCounter,
    };
  }
}
