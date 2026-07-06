import { PostgresConnection } from "../../shared/infrastructure/PostgresConnection.js";
import { Restaurant } from "../domain/Restaurant.js";
import { RestaurantRepository } from "../domain/RestaurantRepository.js";

interface DatabaseRestaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  image_url: string;
  latitude: number;
  longitude: number;
  rating: string;
  comments_count: number;
  created_at: Date;
  updated_at: Date;
}

export class PostgresRestaurantRepository implements RestaurantRepository {
  constructor(private readonly connection: PostgresConnection) {}

  async save(restaurant: Restaurant): Promise<void> {
    const primitives = restaurant.toPrimitives();

    await this.connection.execute`
      INSERT INTO restaurants (id, name, description, address, image_url, latitude, longitude, rating, comments_count)
      VALUES (${primitives.id}, ${primitives.name}, ${primitives.description}, ${primitives.address}, ${primitives.imageUrl}, ${primitives.coordinates.lat}, ${primitives.coordinates.lng}, ${primitives.rating}, ${primitives.commentsCounter})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        address = EXCLUDED.address,
        image_url = EXCLUDED.image_url,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        rating = EXCLUDED.rating,
        comments_count = EXCLUDED.comments_count;
    `;
  }

  async search(id: string): Promise<Restaurant | null> {
    const restaurant = await this.connection.searchOne<DatabaseRestaurant>`
      SELECT id, name, description, address, image_url, latitude, longitude, rating, comments_count, created_at, updated_at
      FROM restaurants
      WHERE id = ${id};
    `;

    if (!restaurant) {
      return null;
    }

    return Restaurant.fromPrimitives({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      imageUrl: restaurant.image_url,
      coordinates: {
        lat: restaurant.latitude,
        lng: restaurant.longitude,
      },
      rating: parseFloat(restaurant.rating),
      commentsCounter: restaurant.comments_count,
    });
  }

  async searchAll(): Promise<Restaurant[]> {
    const restaurants = await this.connection.searchMany<DatabaseRestaurant>`
      SELECT id, name, description, address, image_url, latitude, longitude, rating, comments_count, created_at, updated_at
      FROM restaurants;
    `;

    return restaurants.map((r) =>
      Restaurant.fromPrimitives({
        id: r.id,
        name: r.name,
        description: r.description,
        address: r.address,
        imageUrl: r.image_url,
        coordinates: {
          lat: r.latitude,
          lng: r.longitude,
        },
        rating: parseFloat(r.rating),
        commentsCounter: r.comments_count,
      }),
    );
  }
}
