import { UserInfo } from "@/data/entities/user-info";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";
import { BaseRepository } from "../base/base.repository";

export class UserInfoRepository extends BaseRepository<UserInfo> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.UserInfo);
  }
}
