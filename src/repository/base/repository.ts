import { TYPES } from "@/core/container/types";
import { inject, injectable } from "inversify";
import { DatabaseConnection } from "@/db/connection/connection";
import { UserInfoRepository } from "../implementation/user-info.repository";
import { TaskRepository } from "../implementation/task.repository";
import { UserRepository } from "../implementation/user.repository";
import { PositionsRepository } from "../implementation/positions.repository";
import { OrganizationRepository } from "../implementation/organization.repository";

/**
 * Central repository factory that provides access to all domain-specific repositories
 * Manages the creation and lifecycle of repository instances
 */
@injectable()
export class Repository {
  /** Repository for user management operations */
  public readonly User: UserRepository;
  /** Repository for user information operations */
  public readonly UserInfo: UserInfoRepository;
  /** Repository for task management operations */
  public readonly Task: TaskRepository;
  /** Repository for position management operations */
  public readonly Positions: PositionsRepository;
  /** Repository for organization management operations */
  public readonly Organization: OrganizationRepository;

  /**
   * Initializes all repositories with a shared database connection
   * @param dbConnection The database connection instance to use for all repositories
   */
  constructor(
    @inject(TYPES.DatabaseConnection) dbConnection: DatabaseConnection
  ) {
    this.User = new UserRepository(dbConnection);
    this.UserInfo = new UserInfoRepository(dbConnection);
    this.Task = new TaskRepository(dbConnection);
    this.Positions = new PositionsRepository(dbConnection);
    this.Organization = new OrganizationRepository(dbConnection);
  }
}
