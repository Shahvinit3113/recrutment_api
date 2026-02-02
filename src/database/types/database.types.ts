/**
 * Database table type definitions for Knex
 *
 * Maps table names to their corresponding entity types.
 * This enables TypeScript autocompletion and type checking for database queries.
 */

// Import entities from existing location
import { User } from "@/data/entities/user";
import { Organization } from "@/data/entities/organization";
import { Department } from "@/data/entities/department";
import { Positions } from "@/data/entities/positions";
import { Task } from "@/data/entities/task";
import { FormTemplate } from "@/data/entities/form_template";
import { FormSection } from "@/data/entities/form_section";
import { FormField } from "@/data/entities/form_field";
import { Application } from "@/data/entities/application";
import { EmailTemplate } from "@/data/entities/email_template";
import { UserInfo } from "@/data/entities/user-info";

/**
 * Database table to entity type mapping
 * Used for type-safe repository operations
 */
export interface DatabaseTables {
  Users: User;
  UserInfo: UserInfo;
  Organization: Organization;
  Department: Department;
  Positions: Positions;
  Task: Task;
  FormTemplate: FormTemplate;
  FormSection: FormSection;
  FormField: FormField;
  Application: Application;
  EmailTemplate: EmailTemplate;
}

/**
 * Get entity type from table name
 */
export type EntityFromTable<T extends keyof DatabaseTables> = DatabaseTables[T];

/**
 * Extend Knex module with our table types
 * This enables typed queries: knex<User>('Users')
 */
declare module "knex/types/tables" {
  interface Tables extends DatabaseTables {}
}

/**
 * Database connection configuration options
 */
export interface DatabaseConfigOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  isDevelopment: boolean;
}

/**
 * Re-export entity types for convenience
 */
export {
  User,
  Organization,
  Department,
  Positions,
  Task,
  FormTemplate,
  FormSection,
  FormField,
  Application,
  EmailTemplate,
};
