import { TYPES } from "@/core/container/types";
import { inject, injectable } from "inversify";
import { DatabaseConnection } from "@/db/connection/connection";
import { UserInfoRepository } from "../implementation/user-info.repository";
import { TaskRepository } from "../implementation/task.repository";
import { UserRepository } from "../implementation/user.repository";
import { PositionsRepository } from "../implementation/positions.repository";
import { OrganizationRepository } from "../implementation/organization.repository";
import { DepartmentRepository } from "../implementation/department.repository";
import { FormTemplateRepository } from "../implementation/form_template.repository";

/**
 * Central repository factory that provides access to all domain-specific repositories
 * Manages the creation and lifecycle of repository instances
 */
@injectable()
export class Repository {
  public readonly User: UserRepository;
  public readonly UserInfo: UserInfoRepository;
  public readonly Task: TaskRepository;
  public readonly Positions: PositionsRepository;
  public readonly Organization: OrganizationRepository;
  public readonly Department: DepartmentRepository;
  public readonly FormTemplate: FormTemplateRepository;

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
    this.Department = new DepartmentRepository(dbConnection);
    this.FormTemplate = new FormTemplateRepository(dbConnection);
  }
}
