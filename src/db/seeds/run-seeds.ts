#!/usr/bin/env node
/**
 * ============================================================================
 * SEED RUNNER CLI
 * ============================================================================
 *
 * Run seeds from the command line:
 *
 * # Run all pending seeders
 * npm run seed
 *
 * # Run a specific seeder (even if already executed)
 * npm run seed -- --name AdminUserSeeder --force
 *
 * # Rollback the last batch
 * npm run seed -- --rollback
 *
 * # Show status of all seeders
 * npm run seed -- --status
 */

import "reflect-metadata";
import { DatabaseConnection } from "@/db/connection/connection";
import { SeederManager } from "@/db/seeds/seeder";
import { seeders } from "@/db/seeds/index";

async function main() {
  const args = process.argv.slice(2);
  const db = new DatabaseConnection();
  const manager = new SeederManager(db);

  // Register all seeders
  manager.registerMany(seeders);

  try {
    if (args.includes("--status")) {
      // Show status
      console.log("\n📋 Seeder Status:\n");
      const status = await manager.status();

      for (const s of status) {
        const icon = s.executed ? "✓" : "○";
        const desc = s.description ? ` - ${s.description}` : "";
        console.log(`  ${icon} [${s.order}] ${s.name}${desc}`);
      }
      console.log();
    } else if (args.includes("--rollback")) {
      // Rollback last batch
      console.log("\n🔄 Rolling back last batch...\n");
      const rolledBack = await manager.rollback();

      if (rolledBack.length > 0) {
        console.log(`\n✓ Rolled back ${rolledBack.length} seeder(s)\n`);
      } else {
        console.log("\n⚠ No seeders to rollback\n");
      }
    } else if (args.includes("--name")) {
      // Run specific seeder
      const nameIndex = args.indexOf("--name");
      const name = args[nameIndex + 1];
      const force = args.includes("--force");

      if (!name) {
        console.error("❌ Please provide a seeder name: --name SeederName");
        process.exit(1);
      }

      console.log(
        `\n🌱 Running seeder: ${name}${force ? " (forced)" : ""}...\n`
      );
      const success = await manager.runSeeder(name, force);

      if (success) {
        console.log("\n✓ Seeder completed successfully\n");
      } else {
        console.log("\n⚠ Seeder was not executed\n");
      }
    } else {
      // Run all pending seeders
      console.log("\n🌱 Running pending seeders...\n");
      const result = await manager.run();

      console.log("\n📊 Results:");
      console.log(`  ✓ Success: ${result.success.length}`);
      console.log(`  ✗ Failed: ${result.failed.length}`);
      console.log(`  ⊘ Skipped: ${result.skipped.length}`);
      console.log(`  Batch: ${result.batch}`);

      if (result.failed.length > 0) {
        console.log("\n❌ Failed seeders:");
        for (const f of result.failed) {
          console.log(`  - ${f.name}: ${f.error}`);
        }
        process.exit(1);
      }

      console.log();
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main();
