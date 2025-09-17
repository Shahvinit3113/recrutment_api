import { BaseQueries } from "@/db/queries/base/base.query";
import { User } from "@/data/entities/user";
import { Tables } from "../../helper/table";

export class UserQueries extends BaseQueries<User> {
  constructor() {
    super(Tables.User);
  }
}
