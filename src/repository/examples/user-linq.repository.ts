import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { DatabaseConnection } from "@/db/connection/connection";
import { BaseRepository } from "../base/base.repository";
import { User } from "@/data/entities/user";

/**
 * User Repository with LINQ query examples
 * Demonstrates type-safe query building using LINQ
 */
@injectable()
export class UserLinqRepository extends BaseRepository<User> {
    constructor(@inject(TYPES.DatabaseConnection) db: DatabaseConnection) {
        super(db, "users");
    }

    /**
     * Find an active user by email address using LINQ
     * Demonstrates: where() with multiple conditions, executeLinqFirst()
     */
    async findActiveByEmail(email: string, orgId: string): Promise<User | null> {
        return await this.executeLinqFirst(
            this.linq()
                .where(u =>
                    u.Email === email &&
                    u.OrgId === orgId &&
                    u.IsActive === true &&
                    u.IsDeleted === false
                )
        );
    }

    /**
     * Get recently created users with pagination
     * Demonstrates: where(), orderByDescending(), take()
     */
    async getRecentUsers(orgId: string, limit: number = 10): Promise<User[]> {
        const limitVal = limit;
        return await this.executeLinq(
            this.linq()
                .where(u =>
                    u.OrgId === orgId &&
                    u.IsDeleted === false
                )
                .orderByDescending(u => u.CreatedOn)
                .take(limitVal)
        );
    }

    /**
     * Get active users count by organization
     * Demonstrates: Complex filtering with LINQ
     */
    async getActiveUsersCount(orgId: string): Promise<number> {
        const users = await this.executeLinq(
            this.linq()
                .where(u =>
                    u.OrgId === orgId &&
                    u.IsActive === true &&
                    u.IsDeleted === false
                )
        );
        return users.length;
    }

    /**
     * Get users with pagination using LINQ
     * Demonstrates: skip() and take() for pagination
     */
    async getUsersPaginated(
        orgId: string,
        page: number = 1,
        pageSize: number = 20
    ): Promise<User[]> {
        const pageNum = page;
        const size = pageSize;

        return await this.executeLinq(
            this.linq()
                .where(u =>
                    u.OrgId === orgId &&
                    u.IsDeleted === false
                )
                .orderBy(u => u.CreatedOn)
                .skip((pageNum - 1) * size)
                .take(size)
        );
    }

    /**
     * Get users by role using LINQ
     * Demonstrates: Filtering by enum values
     */
    async getUsersByRole(orgId: string, role: number): Promise<User[]> {
        const roleValue = role;
        return await this.executeLinq(
            this.linq()
                .where(u =>
                    u.OrgId === orgId &&
                    u.Role === roleValue &&
                    u.IsDeleted === false
                )
                .orderBy(u => u.Email)
        );
    }
}
