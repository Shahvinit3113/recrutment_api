import { Knex } from 'knex';

/**
 * Seed data definition interface
 * Describes a seed operation for a single table
 */
export interface SeedDefinition<T> {
  /** Table name to seed */
  tableName: string;
  /** Data records to insert */
  data: T[];
  /** If true, deletes existing data before inserting (dev only) */
  truncateFirst?: boolean;
  /** Keys to use for upsert logic (finds existing then updates or inserts) */
  upsertKeys?: (keyof T)[];
}

/**
 * Seed Runner
 * 
 * Executes seed definitions to populate the database.
 * 
 * NOTE: Seeds do NOT run automatically.
 * Use the command: npm run db:seed
 * 
 * @example
 * ```typescript
 * const runner = new SeedRunner(knex);
 * 
 * await runner.run({
 *   tableName: 'Users',
 *   data: [{ Uid: '...', Email: 'admin@example.com', ... }],
 *   upsertKeys: ['Email'],
 * });
 * ```
 */
export class SeedRunner {
  constructor(private readonly knex: Knex) {}

  /**
   * Run a single seed definition
   */
  async run<T extends object>(seed: SeedDefinition<T>): Promise<void> {
    const { tableName, data, truncateFirst, upsertKeys } = seed;

    if (!data.length) {
      console.log(`⏭️  Skipping ${tableName}: No seed data`);
      return;
    }

    console.log(`🌱 Seeding ${tableName}...`);

    // Truncate only in development
    if (truncateFirst && process.env.NODE_ENV === 'development') {
      await this.knex(tableName).del();
      console.log(`   ↳ Cleared existing data`);
    }

    if (upsertKeys?.length) {
      // Upsert mode: check existence by keys, then insert or update
      await this.upsert(tableName, data, upsertKeys);
    } else {
      // Simple insert
      await this.knex(tableName).insert(data as Record<string, unknown>[]);
    }

    console.log(`   ↳ Processed ${data.length} record(s)`);
  }

  /**
   * Run multiple seeds in order
   */
  async runAll(seeds: SeedDefinition<object>[]): Promise<void> {
    console.log('\n🌱 Starting database seeding...\n');

    for (const seed of seeds) {
      await this.run(seed);
    }

    console.log('\n✅ Seeding complete!\n');
  }

  /**
   * Upsert records based on unique keys
   */
  private async upsert<T extends object>(
    tableName: string,
    data: T[],
    upsertKeys: (keyof T)[]
  ): Promise<void> {
    for (const item of data) {
      // Build where conditions from upsert keys
      const conditions: Record<string, unknown> = {};
      for (const key of upsertKeys) {
        conditions[key as string] = item[key];
      }

      // Check if record exists
      const existing = await this.knex(tableName).where(conditions).first();

      if (existing) {
        // Update existing record
        await this.knex(tableName).where(conditions).update(item as Record<string, unknown>);
        console.log(`   ↳ Updated existing record`);
      } else {
        // Insert new record
        await this.knex(tableName).insert(item as Record<string, unknown>);
        console.log(`   ↳ Inserted new record`);
      }
    }
  }
}
