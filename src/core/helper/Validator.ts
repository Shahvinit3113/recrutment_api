/**
 * Validation Helper Class
 * Comprehensive validation methods
 */
export class Validator {
  static isString(value: any): value is string {
    return typeof value === "string";
  }

  static isNumber(value: any): value is number {
    return typeof value === "number" && !isNaN(value);
  }

  static isBoolean(value: any): value is boolean {
    return typeof value === "boolean";
  }

  static isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  static isObject(value: any): value is object {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  static isDate(value: any): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  static isValidPassword(
    password: string,
    minLength: number = 8
  ): { valid: boolean; errors: string[] } {
    const errors = [];

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return { valid: errors.length === 0, errors };
  }

  static isValidCreditCard(cardNumber: string): boolean {
    const num = cardNumber.replace(/\D/g, "");
    let sum = 0;
    let alternate = false;

    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i));
      if (alternate) {
        digit *= 2;
        if (digit > 9) digit = (digit % 10) + 1;
      }
      sum += digit;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  }

  static isValidIPAddress(ip: string): boolean {
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  static hasMinLength(str: string, minLength: number): boolean {
    return str.length >= minLength;
  }

  static hasMaxLength(str: string, maxLength: number): boolean {
    return str.length <= maxLength;
  }

  static matchesPattern(str: string, pattern: RegExp): boolean {
    return pattern.test(str);
  }

  static isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
