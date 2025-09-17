import { injectable, inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { User } from "@/data/entities/user";
import { DatabaseConnection } from "@/db/connection/connection";
import { UserQueries } from "@/db/queries/implementation/user.query";
import { Respository } from "../base/repository";

@injectable()
export class UserRepository extends Respository<User> {
  constructor(@inject(TYPES.DatabaseConnection) db: DatabaseConnection) {
    super(db, new UserQueries());
  }
}
