import { PostgresConnection } from "../../shared/infrastructure/PostgresConnection.js";
import { Reservation } from "../domain/Reservation.js";
import { ReservationRepository } from "../domain/ReservationRepository.js";

interface DatabaseReservation {
  id: string;
  restaurant_id: string;
  user_id: string;
  date: Date;
  time: string;
  party_size: number;
  status: "confirmed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export class PostgresReservationRepository implements ReservationRepository {
  constructor(private readonly connection: PostgresConnection) {}

  async save(reservation: Reservation): Promise<void> {
    const primitives = reservation.toPrimitives();

    await this.connection.execute`
      INSERT INTO reservations (id, restaurant_id, user_id, date, time, party_size, status)
      VALUES (${primitives.id}, ${primitives.restaurantId}, ${primitives.userId}, ${primitives.date}, ${primitives.time}, ${primitives.partySize}, ${primitives.status})
      ON CONFLICT (id) DO UPDATE SET
        restaurant_id = EXCLUDED.restaurant_id,
        user_id = EXCLUDED.user_id,
        date = EXCLUDED.date,
        time = EXCLUDED.time,
        party_size = EXCLUDED.party_size,
        status = EXCLUDED.status;
    `;
  }

  async searchByRestaurantAndDate(
    restaurantId: string,
    date: string,
  ): Promise<Reservation[]> {
    const reservations = await this.connection.searchMany<DatabaseReservation>`
        SELECT id, restaurant_id, user_id, date, time, party_size, status, created_at, updated_at
        FROM reservations
        WHERE restaurant_id = ${restaurantId} AND date = ${date} AND status = 'confirmed';
      `;

    return reservations.map((r) => {
      return Reservation.fromPrimitives({
        id: r.id,
        restaurantId: r.restaurant_id,
        userId: r.user_id,
        date: r.date.toISOString().substring(0, 10),
        time: r.time.substring(0, 5),
        partySize: r.party_size,
        status: r.status,
      });
    });
  }
}
