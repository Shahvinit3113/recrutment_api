import { DatabaseConnection } from "@/db/connection/connection";

/**
 * ============================================================================
 * SEEDER BASE CLASS
 * ============================================================================
 *
 * Base class for database seeders. Extend this class to create seed files
 * for populating your database with initial or test data.
 *
 * @example
 * export class UserSeeder extends Seeder {
 *   name = "UserSeeder";
 *   order = 1; // Run first
 *
 *   async run(db: DatabaseConnection): Promise<void> {
 *     await db.execute(
 *       "INSERT INTO User (Id, Email, ...) VALUES (?, ?, ...)",
 *       ["uuid", "admin@example.com", ...]
 *     );
 *   }
 * }
 */
export abstract class Seeder {
  /** Unique name for the seeder (used for tracking) */
  abstract readonly name: string;

  /** Order of execution (lower numbers run first) */
  abstract readonly order: number;

  /** Optional description */
  description?: string;

  /**
   * Run the seeder
   * @param db Database connection to use for seeding
   */
  abstract run(db: DatabaseConnection): Promise<void>;

  /**
   * Optional: Undo the seeder (for rollback)
   * @param db Database connection to use for rollback
   */
  async rollback?(db: DatabaseConnection): Promise<void>;
}

/**
 * Seeder metadata stored in database
 */
export interface SeederRecord {
  name: string;
  executedAt: Date;
  batch: number;
}

/**
 * ============================================================================
 * SEEDER MANAGER
 * ============================================================================
 *
 * Manages seeder execution, tracking, and rollback.
 */
export class SeederManager {
  private seeders: Seeder[] = [];
  private db: DatabaseConnection;
  private tableName = "_seeds";

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Register a seeder
   */
  register(seeder: Seeder): this {
    this.seeders.push(seeder);
    return this;
  }

  /**
   * Register multiple seeders
   */
  registerMany(seeders: Seeder[]): this {
    this.seeders.push(...seeders);
    return this;
  }

  /**
   * Ensure the seeds tracking table exists
   */
  private async ensureSeedsTable(): Promise<void> {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        batch INT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  /**
   * Get already executed seeder names
   */
  private async getExecutedSeeders(): Promise<string[]> {
    const [rows] = await this.db.execute(`SELECT name FROM ${this.tableName}`);
    return (rows as any[]).map((row) => row.name);
  }

  /**
   * Get the current batch number
   */
  private async getCurrentBatch(): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT MAX(batch) as maxBatch FROM ${this.tableName}`
    );
    const result = (rows as any[])[0];
    return (result?.maxBatch || 0) + 1;
  }

  /**
   * Mark a seeder as executed
   */
  private async markAsExecuted(name: string, batch: number): Promise<void> {
    await this.db.execute(
      `INSERT INTO ${this.tableName} (name, batch) VALUES (?, ?)`,
      [name, batch]
    );
  }

  /**
   * Run all pending seeders
   */
  async run(): Promise<SeederRunResult> {
    await this.ensureSeedsTable();

    const executed = await this.getExecutedSeeders();
    const batch = await this.getCurrentBatch();

    // Sort seeders by order
    const sortedSeeders = [...this.seeders].sort((a, b) => a.order - b.order);

    // Filter pending seeders
    const pending = sortedSeeders.filter((s) => !executed.includes(s.name));

    const results: SeederRunResult = {
      success: [],
      failed: [],
      skipped: executed,
      batch,
    };

    for (const seeder of pending) {
      try {
        console.log(`Running seeder: ${seeder.name}...`);
        await seeder.run(this.db);
        await this.markAsExecuted(seeder.name, batch);
        results.success.push(seeder.name);
        console.log(`✓ ${seeder.name} completed`);
      } catch (error) {
        console.error(`✗ ${seeder.name} failed:`, error);
        results.failed.push({
          name: seeder.name,
          error: error instanceof Error ? error.message : String(error),
        });
        // Stop on first failure
        break;
      }
    }

    return results;
  }

  /**
   * Run a specific seeder by name (even if already executed)
   */
  async runSeeder(name: string, force = false): Promise<boolean> {
    const seeder = this.seeders.find((s) => s.name === name);
    if (!seeder) {
      throw new Error(`Seeder "${name}" not found`);
    }

    await this.ensureSeedsTable();
    const executed = await this.getExecutedSeeders();

    if (executed.includes(name) && !force) {
      console.log(
        `Seeder "${name}" already executed. Use force=true to re-run.`
      );
      return false;
    }

    try {
      console.log(`Running seeder: ${seeder.name}...`);
      await seeder.run(this.db);

      if (!executed.includes(name)) {
        const batch = await this.getCurrentBatch();
        await this.markAsExecuted(name, batch);
      }

      console.log(`✓ ${seeder.name} completed`);
      return true;
    } catch (error) {
      console.error(`✗ ${seeder.name} failed:`, error);
      return false;
    }
  }

  /**
   * Rollback the last batch of seeders
   */
  async rollback(): Promise<string[]> {
    await this.ensureSeedsTable();

    // Get the last batch
    const [rows] = await this.db.execute(
      `SELECT name, batch FROM ${this.tableName} WHERE batch = (SELECT MAX(batch) FROM ${this.tableName}) ORDER BY id DESC`
    );

    const toRollback = rows as Array<{ name: string; batch: number }>;
    const rolledBack: string[] = [];

    for (const record of toRollback) {
      const seeder = this.seeders.find((s) => s.name === record.name);
      if (seeder?.rollback) {
        try {
          console.log(`Rolling back: ${seeder.name}...`);
          await seeder.rollback(this.db);
          await this.db.execute(
            `DELETE FROM ${this.tableName} WHERE name = ?`,
            [record.name]
          );
          rolledBack.push(record.name);
          console.log(`✓ ${seeder.name} rolled back`);
        } catch (error) {
          console.error(`✗ ${seeder.name} rollback failed:`, error);
          break;
        }
      } else {
        console.log(`⚠ ${record.name} has no rollback method, skipping...`);
      }
    }

    return rolledBack;
  }

  /**
   * Get status of all seeders
   */
  async status(): Promise<SeederStatus[]> {
    await this.ensureSeedsTable();
    const executed = await this.getExecutedSeeders();

    return this.seeders
      .sort((a, b) => a.order - b.order)
      .map((seeder) => ({
        name: seeder.name,
        order: seeder.order,
        description: seeder.description,
        executed: executed.includes(seeder.name),
      }));
  }
}

export interface SeederRunResult {
  success: string[];
  failed: Array<{ name: string; error: string }>;
  skipped: string[];
  batch: number;
}

export interface SeederStatus {
  name: string;
  order: number;
  description?: string;
  executed: boolean;
}
