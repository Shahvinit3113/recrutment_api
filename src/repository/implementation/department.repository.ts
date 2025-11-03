import { Department } from "@/data/entities/department";
import { BaseRepository } from "../base/base.repository";
import { Tables } from "@/db/helper/table";
import { DatabaseConnection } from "@/db/connection/connection";

/**
 * Repository for managing department data
 * Provides specialized data access operations for organizations
 */
export class DepartmentRepository extends BaseRepository<Department> {
  /**
   * Initializes a new department repository
   * @param db Database connection instance
   */
  constructor(db: DatabaseConnection) {
    super(db, Tables.Department);
  }
}
