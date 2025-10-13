import { User } from "@/data/entities/user";
import { BaseQueries } from "./base/base.query";
import { Tables } from "../helper/table";

export class UserQuery extends BaseQueries<User> {
  constructor() {
    super(Tables.User);
  }
}
