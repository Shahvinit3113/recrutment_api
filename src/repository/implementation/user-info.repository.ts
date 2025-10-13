import { UserInfo } from "@/data/entities/user-info";
import { BaseRespository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { UserInfoQuery } from "@/db/queries/user-info.query";

export class UserInfoRepository extends BaseRespository<
  UserInfo,
  UserInfoQuery
> {
  constructor(db: DatabaseConnection) {
    super(db, new UserInfoQuery());
  }
}
