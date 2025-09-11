import * as jwt from "jsonwebtoken";
import { config } from "../config/environment";
import { Role } from "@/data/enums/role";

interface JWTPayload {
  UserId: string;
  Email: string;
  Role: Role;
}

interface JWTOptions {
  ExpiresIn?: string | number;
  Issuer?: string;
  Audience?: string;
}

interface JWTDecodeResult {
  Valid: boolean;
  Payload?: JWTPayload;
  Expired?: boolean;
  Error?: string;
}

/**
 * JWT Helper Class
 * Comprehensive JWT token operations
 */
export class JWT {
  private static readonly DEFAULT_SECRET = config.JWT_SECRET;
  private static readonly DEFAULT_EXPIRES_IN = config.JWT_EXPIRES_IN;
  private static readonly REFRESH_EXPIRES_IN = config.JWT_REFRESH_EXPIRES_IN;
  private static readonly DEFAULT_ALGORITHM = config.JWT_ALGORITHM;

  static encode(payload: JWTPayload, options?: JWTOptions): string {
    try {
      const jwtOptions: jwt.SignOptions = {
        expiresIn: (options?.ExpiresIn as any) || this.DEFAULT_EXPIRES_IN,
        algorithm: this.DEFAULT_ALGORITHM,
        ...(options?.Issuer && { issuer: options.Issuer }),
        ...(options?.Audience && { audience: options.Audience }),
      };

      return jwt.sign(payload, this.DEFAULT_SECRET, jwtOptions);
    } catch (error) {
      throw new Error(`JWT encoding failed: ${error.message}`);
    }
  }

  static decode(token: string): JWTDecodeResult {
    try {
      const payload = jwt.verify(token, this.DEFAULT_SECRET) as JWTPayload;

      return { Valid: true, Payload: payload };
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return { Valid: false, Expired: true, Error: "Token has expired" };
      }
      return { Valid: false, Expired: false, Error: error.message };
    }
  }

  static decodeWithoutVerification(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  static isExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  private static generateRefreshToken(
    payload: JWTPayload,
    options?: JWTOptions
  ): string {
    return this.encode(payload, {
      ...options,
      ExpiresIn: this.REFRESH_EXPIRES_IN,
    });
  }

  static generateTokenPair(payload: JWTPayload, options?: JWTOptions) {
    return {
      accessToken: this.encode(payload, options),
      refreshToken: this.generateRefreshToken(payload, options),
    };
  }
}
