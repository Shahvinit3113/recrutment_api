import { UserInfo } from "@/data/entities/user-info";
import { BaseQueries } from "./base/base.query";
import { Tables } from "../helper/table";

export class UserInfoQuery extends BaseQueries<UserInfo> {
  constructor() {
    super(Tables.UserInfo);
  }
}
