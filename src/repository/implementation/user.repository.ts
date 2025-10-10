import { User } from "@/data/entities/user";
import { DatabaseConnection } from "@/db/connection/connection";
import { BaseRespository, IBaseRepository } from "../base/base.repository";
import { Tables } from "@/db/helper/table";

export interface IUserRepository extends IBaseRepository<User> {
  getByEmail(email: string, columns?: [keyof User]): Promise<User | null>;
}

export class UserRepository
  extends BaseRespository<User>
  implements IUserRepository
{
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
