import { User } from '@/data/entities/user';
import { Role } from '@/data/enums/role';
import { SeedDefinition } from '../runners';
import { DEFAULT_ORG_ID } from './organization.seed';

/**
 * Create user seed data
 * 
 * NOTE: Passwords should be hashed before seeding.
 * This is a factory function because password hashing is async.
 * 
 * @param hashedPassword - Pre-hashed password for the admin user
 */
export function createUserSeedData(hashedPassword: string): User[] {
  return [
    {
      Uid: 'user-admin-001',
      OrgId: DEFAULT_ORG_ID,
      Email: 'admin@recruitment.local',
      Password: hashedPassword,
      Role: Role.Admin,
      IsActive: true,
      IsDeleted: false,
      CreatedOn: new Date(),
      CreatedBy: 'system',
      UpdatedOn: null,
      UpdatedBy: null,
      DeletedOn: null,
    },
  ];
}

/**
 * Create user seed definition
 * 
 * @param hashedPassword - Pre-hashed password for users
 */
export function createUserSeed(hashedPassword: string): SeedDefinition<User> {
  return {
    tableName: 'Users',
    data: createUserSeedData(hashedPassword),
    upsertKeys: ['Email'],
  };
}
