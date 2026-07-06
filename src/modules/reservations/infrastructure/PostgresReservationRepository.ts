import { PostgresConnection } from "../../shared/infrastructure/PostgresConnection.js";
import { Reservation } from "../domain/Reservation.js";
import { ReservationRepository } from "../domain/ReservationRepository.js";

// interface DatabaseReservation {
//   id: string;
//   restaurant_id: string;
//   user_id: string;
//   date: string;
//   time: string;
//   party_size: number;
//   status: "confirmed" | "cancelled";
//   created_at: string;
//   updated_at: string;
// }

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
}
