import { BaseQueries } from "@/db/queries/base/base.query";
import { User } from "@/data/entities/user";

export class UserQueries extends BaseQueries<User> {
  constructor() {
    super("Users");
  }
}
