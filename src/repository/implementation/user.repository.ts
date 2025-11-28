import { User } from "@/data/entities/user";
import { DatabaseConnection } from "@/db/connection/connection";
import { BaseRepository } from "../base/base.repository";
import { Tables } from "@/db/helper/table";
import { Role } from "@/data/enums/role";

export class UserRepository extends BaseRepository<User> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.User);
  }

  /**
   * Traditional SQL method - Get user by email
   */
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

  /**
   * LINQ Example - Find active user by email
   * Demonstrates type-safe query building
   */
  async findActiveByEmail(email: string, orgId: string): Promise<User | null> {
    return await this.executeLinqFirst(
      this.linq()
        .where(u =>
          u.Email === email &&
          u.OrgId === orgId &&
          u.IsActive === true &&
          u.IsDeleted === false
        )
    );
  }

  /**
   * LINQ Example - Get users by role
   * Demonstrates enum filtering with LINQ
   */
  async getUsersByRole(orgId: string, role: Role): Promise<User[]> {
    const roleValue = role;
    return await this.executeLinq(
      this.linq()
        .where(u =>
          u.OrgId === orgId &&
          u.Role === roleValue &&
          u.IsDeleted === false
        )
        .orderBy(u => u.Email)
    );
  }
}
