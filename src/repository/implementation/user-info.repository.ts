import { UserInfo } from "@/data/entities/user-info";
import { BaseRespository, IBaseRepository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";

export interface IUserInfoRepository extends IBaseRepository<UserInfo> {}

export class UserInfoRepository
  extends BaseRespository<UserInfo>
  implements IUserInfoRepository
{
  constructor(db: DatabaseConnection) {
    super(db, Tables.UserInfo);
  }
}
