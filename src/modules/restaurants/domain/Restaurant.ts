import {
  ReservationSettings,
  type ReservationSettingsPrimitives,
} from "./ReservationSettings.js";

export interface RestaurantPrimitives {
  id: string;
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  commentsCounter: number;
  capacity: number;
  cuisineType: string;
  reservationSettings: ReservationSettingsPrimitives;
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
    private readonly capacity: number,
    private readonly cuisineType: string,
    private readonly reservationSettings: ReservationSettings,
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
      primitives.capacity,
      primitives.cuisineType,
      ReservationSettings.fromPrimitives(primitives.reservationSettings),
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
      capacity: this.capacity,
      cuisineType: this.cuisineType,
      reservationSettings: this.reservationSettings.toPrimitives(),
    };
  }
}
