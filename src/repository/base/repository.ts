import { TYPES } from "@/core/container/types";
import { inject, injectable } from "inversify";
import { DatabaseConnection } from "@/db/connection/connection";
import { UserInfoRepository } from "../implementation/user-info.repository";
import { TaskRepository } from "../implementation/task.repository";
import { UserRepository } from "../implementation/user.repository";
import { PositionsRepository } from "../implementation/positions.repository";

@injectable()
export class Repository {
  public readonly User: UserRepository;
  public readonly UserInfo: UserInfoRepository;
  public readonly Task: TaskRepository;
  public readonly Positions: PositionsRepository;

  constructor(
    @inject(TYPES.DatabaseConnection) dbConnection: DatabaseConnection
  ) {
    this.User = new UserRepository(dbConnection);
    this.UserInfo = new UserInfoRepository(dbConnection);
    this.Task = new TaskRepository(dbConnection);
    this.Positions = new PositionsRepository(dbConnection);
  }
}
