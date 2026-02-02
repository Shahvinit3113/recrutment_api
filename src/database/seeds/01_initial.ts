import { Knex } from 'knex';
import bcrypt from 'bcrypt';
import { SeedRunner } from './runners';
import { organizationSeed, createUserSeed } from './data';

/**
 * Initial Database Seed
 * 
 * Run with: npm run db:seed
 * 
 * This seed file creates:
 * - Default organization
 * - Admin user with password 'Admin@123'
 */
export async function seed(knex: Knex): Promise<void> {
  const runner = new SeedRunner(knex);

  console.log('\n📦 Running initial seeds...\n');

  // 1. Seed organizations first (required for foreign key relationships)
  await runner.run(organizationSeed);

  // 2. Hash password and seed users
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const userSeed = createUserSeed(hashedPassword);
  await runner.run(userSeed);

  console.log('\n✅ Initial seeding complete!');
  console.log('   Admin credentials:');
  console.log('   Email: admin@recruitment.local');
  console.log('   Password: Admin@123\n');
}
