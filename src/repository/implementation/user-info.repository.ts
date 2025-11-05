import { UserInfo } from "@/data/entities/user-info";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";
import { BaseRepository } from "../base/base.repository";

export class UserInfoRepository extends BaseRepository<UserInfo> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.UserInfo);
  }

  async getByEmail(email: string, columns?: [keyof UserInfo]) {
    if (!email && !email?.length) return null;

    const fields = columns?.length ? columns.join(", ") : "*";

    const [rows] = await this._db.execute(
      `select ${fields} from ${Tables.UserInfo} where IsDeleted = 0 AND Email = ?`,
      [email]
    );

    const result = (rows as UserInfo[])?.[0];
    return result || null;
  }
}
