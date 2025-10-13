import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import { config } from "../config/environment";

/**
 * Security Helper Class
 * Handles encryption, hashing, and security operations
 */
export class Security {
  private static readonly SALT_ROUNDS = config.BCRYPT_ROUNDS;
  private static readonly ENCRYPTION_ALGORITHM = config.BCRYPT_ALGORITHM;

  static async hashPassword(
    password: string,
    saltRounds: number = this.SALT_ROUNDS
  ): Promise<string> {
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error(`Password hashing failed: ${error.message}`);
    }
  }

  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Password comparison failed: ${error.message}`);
    }
  }

  static encrypt(
    text: string,
    secretKey: string
  ): { encrypted: string; iv: string; tag: string } {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.ENCRYPTION_ALGORITHM, secretKey);
      cipher.setAAD(Buffer.from("authenticated"));

      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");

      return {
        encrypted,
        iv: iv.toString("hex"),
        tag: cipher.getAuthTag().toString("hex"),
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  static decrypt(
    encryptedData: { encrypted: string; iv: string; tag: string },
    secretKey: string
  ): string {
    try {
      const decipher = crypto.createDecipher(
        this.ENCRYPTION_ALGORITHM,
        secretKey
      );
      decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));
      decipher.setAAD(Buffer.from("authenticated"));

      let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}
