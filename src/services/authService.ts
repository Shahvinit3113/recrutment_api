import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "@/database/repositories/userRepository";
import { AppError } from "@/utils/errors/AppError";
import { ErrorCodes } from "@/utils/errors/errorCodes";
import { config } from "@/config/environment";
import { User, UserType } from "@/types/user";
import { logger } from "@/utils/logger";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  user_type: UserType;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, "password_hash">;
}

interface TokenPayload {
  userId: number;
  email: string;
  userType: UserType;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(registerData: RegisterData): Promise<AuthTokens> {
    try {
      // Validate email format
      if (!this.isValidEmail(registerData.email)) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          400,
          "Invalid email format"
        );
      }

      // Validate password strength
      if (!this.isValidPassword(registerData.password)) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          400,
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(
        registerData.password,
        config.BCRYPT_ROUNDS
      );

      // Create user
      const userData = {
        ...registerData,
        password_hash: passwordHash,
      };
      delete (userData as any).password;

      const user = await this.userRepository.createUser(userData);

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      logger.info(`User registered successfully: ${user.email}`);

      return {
        ...tokens,
        user: this.excludePassword(user),
      };
    } catch (error) {
      logger.error("Registration failed:", error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      // Find user with password
      const user = await this.userRepository.findByEmailWithPassword(
        credentials.email
      );
      if (!user) {
        throw new AppError(
          ErrorCodes.INVALID_CREDENTIALS,
          401,
          "Invalid email or password"
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password_hash
      );
      if (!isPasswordValid) {
        throw new AppError(
          ErrorCodes.INVALID_CREDENTIALS,
          401,
          "Invalid email or password"
        );
      }

      // Check if user is active
      if (!user.is_active) {
        throw new AppError(ErrorCodes.FORBIDDEN, 403, "Account is deactivated");
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        ...tokens,
        user: this.excludePassword(user),
      };
    } catch (error) {
      logger.error("Login failed:", error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = jwt.verify(
        refreshToken,
        config.JWT_REFRESH_SECRET
      ) as TokenPayload;

      // Find user
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.is_active) {
        throw new AppError(
          ErrorCodes.TOKEN_INVALID,
          401,
          "Invalid refresh token"
        );
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      logger.info(`Token refreshed for user: ${user.email}`);

      return {
        ...tokens,
        user: this.excludePassword(user),
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(
          ErrorCodes.TOKEN_INVALID,
          401,
          "Invalid refresh token"
        );
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(
          ErrorCodes.TOKEN_EXPIRED,
          401,
          "Refresh token expired"
        );
      }
      throw error;
    }
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(ErrorCodes.TOKEN_INVALID, 401, "Invalid token");
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(ErrorCodes.TOKEN_EXPIRED, 401, "Token expired");
      }
      throw error;
    }
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Get user with current password hash
      const userWithPassword =
        await this.userRepository.findByEmailWithPassword(
          (await this.userRepository.findById(userId))?.email || ""
        );

      if (!userWithPassword) {
        throw new AppError(ErrorCodes.RECORD_NOT_FOUND, 404, "User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        userWithPassword.password_hash
      );
      if (!isCurrentPasswordValid) {
        throw new AppError(
          ErrorCodes.INVALID_CREDENTIALS,
          400,
          "Current password is incorrect"
        );
      }

      // Validate new password
      if (!this.isValidPassword(newPassword)) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          400,
          "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
        );
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(
        newPassword,
        config.BCRYPT_ROUNDS
      );

      // Update password
      await this.userRepository.updateById(userId, {
        password_hash: newPasswordHash,
      });

      logger.info(`Password changed for user: ${userWithPassword.email}`);
    } catch (error) {
      logger.error("Password change failed:", error);
      throw error;
    }
  }

  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: Omit<TokenPayload, "iat" | "exp"> = {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
    };

    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  private excludePassword(user: User): Omit<User, "password_hash"> {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}
