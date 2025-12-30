import { Seeder } from "../seeder";
import { DatabaseConnection } from "@/db/connection/connection";
import { randomUUID } from "crypto";
import { Security } from "@/core/utils/security.utils";
import { Role } from "@/data/enums/role";

/**
 * Initial admin user seeder
 * Creates the first admin user for the system
 */
export class AdminUserSeeder extends Seeder {
  name = "AdminUserSeeder";
  order = 10;
  description = "Creates the initial admin user";

  async run(db: DatabaseConnection): Promise<void> {
    const adminId = randomUUID();
    const adminInfoId = randomUUID();
    const tenantId = "default-tenant"; // Replace with your default tenant
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Create user info first
    await db.execute(
      `INSERT INTO UserInfo (Id, FirstName, LastName, PhoneNumber, ProfilePicture, IsDeleted, TenantId, CreatedBy, CreatedOn)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminInfoId,
        "System",
        "Administrator",
        null,
        null,
        false,
        tenantId,
        "system",
        now,
      ]
    );

    // Create admin user
    const hashedPassword = await Security.hashPassword("Admin@123!");
    await db.execute(
      `INSERT INTO User (Id, Email, Password, IsVerified, Role, InfoId, IsDeleted, TenantId, CreatedBy, CreatedOn)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        "admin@system.com",
        hashedPassword,
        true,
        Role.Admin,
        adminInfoId,
        false,
        tenantId,
        "system",
        now,
      ]
    );

    console.log("  → Created admin user: admin@system.com");
  }

  async rollback(db: DatabaseConnection): Promise<void> {
    await db.execute(`DELETE FROM User WHERE Email = ?`, ["admin@system.com"]);
    await db.execute(
      `DELETE FROM UserInfo WHERE FirstName = ? AND LastName = ?`,
      ["System", "Administrator"]
    );
  }
}
