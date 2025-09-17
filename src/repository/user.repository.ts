import { injectable, inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { Respository } from "@/repository/implementation/repository";
import { User } from "@/data/entities/user";
import { DatabaseConnection } from "@/db/connection/connection";
import { UserQueries } from "@/db/queries/user.query";

@injectable()
export class UserRepository extends Respository<User> {
  constructor(@inject(TYPES.DatabaseConnection) db: DatabaseConnection) {
    super(db, new UserQueries());
  }
}
