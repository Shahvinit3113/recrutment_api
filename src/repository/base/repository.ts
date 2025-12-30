import { TYPES } from "@/core/container/types";
import { inject, injectable } from "inversify";
import { DatabaseConnection } from "@/db/connection/connection";
import { UnitOfWork } from "@/db/connection/unit-of-work";
import { UserInfoRepository } from "../implementation/user-info.repository";
import { TaskRepository } from "../implementation/task.repository";
import { UserRepository } from "../implementation/user.repository";
import { PositionsRepository } from "../implementation/positions.repository";
import { OrganizationRepository } from "../implementation/organization.repository";
import { DepartmentRepository } from "../implementation/department.repository";
import { FormTemplateRepository } from "../implementation/form_template.repository";
import { FormSectionRepository } from "../implementation/form_section.repository";
import { FormFieldRepository } from "../implementation/form_field.repository";

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
  public readonly FormSection: FormSectionRepository;
  public readonly FormField: FormFieldRepository;
  public readonly UnitOfWork!: UnitOfWork;

  /**
   * Initializes all repositories with a shared database connection and unit of work
   * @param dbConnection The database connection instance to use for all repositories
   * @param unitOfWork The unit of work instance for transaction management
   */
  constructor(
    @inject(TYPES.DatabaseConnection) dbConnection: DatabaseConnection,
    @inject(TYPES.UnitOfWork) unitOfWork: UnitOfWork
  ) {
    this.User = new UserRepository(dbConnection);
    this.UserInfo = new UserInfoRepository(dbConnection);
    this.Task = new TaskRepository(dbConnection);
    this.Positions = new PositionsRepository(dbConnection);
    this.Organization = new OrganizationRepository(dbConnection);
    this.Department = new DepartmentRepository(dbConnection);
    this.FormTemplate = new FormTemplateRepository(dbConnection);
    this.FormSection = new FormSectionRepository(dbConnection);
    this.FormField = new FormFieldRepository(dbConnection);
  }
}
