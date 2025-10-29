import { User } from "@/data/entities/user";
import { DatabaseConnection } from "@/db/connection/connection";
import { BaseRepository } from "../base/base.repository";
import { Tables } from "@/db/helper/table";

export class UserRepository extends BaseRepository<User> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.User);
  }

  async getByEmail(email: string, columns?: [keyof User]) {
    if (!email && !email?.length) return null;

    const fields = columns?.length ? columns.join(", ") : "*";

    const [rows] = await this._db.execute(
      `select ${fields} from ${Tables.User} where IsDeleted = 0 AND Email = ?`,
      [email]
    );

    const result = (rows as User[])?.[0];
    return result || null;
  }
}
