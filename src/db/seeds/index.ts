/**
 * ============================================================================
 * SEEDER REGISTRY
 * ============================================================================
 *
 * Register all your seeders here. They will be executed in order of their
 * `order` property when running the seed command.
 */

import { Seeder } from "./seeder";
import { AdminUserSeeder } from "./seeders/001-admin-user.seeder";

// Add new seeders to this array
// They will be sorted by order property automatically
export const seeders: Seeder[] = [
  new AdminUserSeeder(),
  // Add more seeders here:
  // new DepartmentSeeder(),
  // new PositionSeeder(),
  // etc.
];

export * from "./seeder";
