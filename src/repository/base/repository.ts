import { TYPES } from "@/core/container/types";
import {
  IUserRepository,
  UserRepository,
} from "../implementation/user.repository";
import { inject, injectable } from "inversify";
import { DatabaseConnection } from "@/db/connection/connection";
import {
  IUserInfoRepository,
  UserInfoRepository,
} from "../implementation/user-info.repository";

@injectable()
export class Repository {
  public readonly User: IUserRepository;
  public readonly UserInfo: IUserInfoRepository;

  constructor(
    @inject(TYPES.DatabaseConnection) dbConnection: DatabaseConnection
  ) {
    this.User = new UserRepository(dbConnection);
    this.UserInfo = new UserInfoRepository(dbConnection);
  }
}
