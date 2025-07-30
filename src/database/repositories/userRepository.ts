import { BaseRepository } from "./baseRepository";
import { AppError } from "@/utils/errors/AppError";
import { ErrorCodes } from "@/utils/errors/errorCodes";
import { User, UserType } from "@/types/user";

interface CreateUserData {
  email: string;
  password_hash: string;
  user_type: UserType;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  profile_image_url?: string;
}

interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  profile_image_url?: string;
  is_active?: boolean;
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super("users");
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email, is_active: true });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, user_type, first_name, last_name, 
             phone, date_of_birth, gender, profile_image_url, is_active,
             email_verified, created_at, updated_at, last_login
      FROM users 
      WHERE email = ? AND is_active = true
    `;
    return await this.executor.selectOne<User>(query, [email]);
  }

  async createUser(userData: CreateUserData): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError(
        ErrorCodes.DUPLICATE_ENTRY,
        400,
        "Email already exists"
      );
    }

    const { insertId } = await this.create(userData);
    const user = await this.findById(insertId);

    if (!user) {
      throw new AppError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        500,
        "Failed to create user"
      );
    }

    return user;
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<User> {
    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new AppError(ErrorCodes.RECORD_NOT_FOUND, 404, "User not found");
    }

    // Check email uniqueness if email is being updated
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.findByEmail(userData.email);
      if (emailExists) {
        throw new AppError(
          ErrorCodes.DUPLICATE_ENTRY,
          400,
          "Email already exists"
        );
      }
    }

    await this.updateById(id, userData);
    const updatedUser = await this.findById(id);

    if (!updatedUser) {
      throw new AppError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        500,
        "Failed to update user"
      );
    }

    return updatedUser;
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.updateById(id, { last_login: new Date() });
  }

  async verifyEmail(id: number): Promise<void> {
    await this.updateById(id, { email_verified: true });
  }

  async deactivateUser(id: number): Promise<void> {
    await this.updateById(id, { is_active: false });
  }

  async findUsersByType(userType: UserType, limit?: number): Promise<User[]> {
    return await this.findMany(
      { user_type: userType, is_active: true },
      {
        orderBy: [{ field: "created_at", direction: "DESC" }],
        limit,
      }
    );
  }

  async searchUsers(searchTerm: string, userType?: UserType): Promise<User[]> {
    const whereConditions: Record<string, any> = { is_active: true };
    if (userType) {
      whereConditions.user_type = userType;
    }

    const query = `
      SELECT * FROM users 
      WHERE is_active = true 
        ${userType ? "AND user_type = ?" : ""}
        AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)
      ORDER BY first_name ASC, last_name ASC
      LIMIT 50
    `;

    const searchPattern = `%${searchTerm}%`;
    const values = userType
      ? [userType, searchPattern, searchPattern, searchPattern]
      : [searchPattern, searchPattern, searchPattern];

    return await this.executeRawQuery<User[]>(query, values);
  }
}
