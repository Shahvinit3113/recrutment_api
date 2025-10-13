interface TimeZoneInfo {
  timezone: string;
  offset: string;
  abbreviation: string;
}

interface DateDifference {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

/**
 * Date Helper Class
 * Comprehensive date and time manipulation utilities
 */
export class DateHelper {
  private static readonly MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
  private static readonly MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
  private static readonly MILLISECONDS_PER_MINUTE = 60 * 1000;
  private static readonly MILLISECONDS_PER_SECOND = 1000;

  /**
   * Get current date and time
   * @returns Current Date object
   */
  static now(): Date {
    return new Date();
  }

  /**
   * Get current UTC date and time
   * @returns Current Date object in UTC
   */
  static utcNow(): Date {
    const now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  }

  /**
   * Get current timestamp in milliseconds
   * @returns Timestamp in milliseconds
   */
  static timestamp(): number {
    return Date.now();
  }

  /**
   * Get current Unix timestamp in seconds
   * @returns Unix timestamp in seconds
   */
  static unixTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Create date from Unix timestamp
   * @param timestamp Unix timestamp in seconds
   * @returns Date object
   */
  static fromUnixTimestamp(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }

  /**
   * Format date with various options
   * @param date Date to format
   * @param format Format type or custom format string
   * @param locale Locale string (default: 'en-US')
   * @param timezone Timezone string
   * @returns Formatted date string
   */
  static format(
    date: Date,
    format:
      | "iso"
      | "date"
      | "time"
      | "datetime"
      | "full"
      | "short"
      | "medium"
      | "long"
      | string = "iso",
    locale: string = "en-US",
    timezone?: string
  ): string {
    const options: Intl.DateTimeFormatOptions = timezone
      ? { timeZone: timezone }
      : {};

    switch (format) {
      case "iso":
        return date.toISOString();
      case "date":
        return date.toLocaleDateString(locale, options);
      case "time":
        return date.toLocaleTimeString(locale, options);
      case "datetime":
        return date.toLocaleString(locale, options);
      case "full":
        return date.toLocaleDateString(locale, {
          ...options,
          dateStyle: "full",
        });
      case "short":
        return date.toLocaleDateString(locale, {
          ...options,
          dateStyle: "short",
        });
      case "medium":
        return date.toLocaleDateString(locale, {
          ...options,
          dateStyle: "medium",
        });
      case "long":
        return date.toLocaleDateString(locale, {
          ...options,
          dateStyle: "long",
        });
      default:
        // Custom format (basic implementation)
        return this.customFormat(date, format, locale, timezone);
    }
  }

  /**
   * Custom date formatting
   * @param date Date to format
   * @param format Format string (yyyy, MM, dd, HH, mm, ss, etc.)
   * @param locale Locale string
   * @param timezone Timezone string
   * @returns Formatted date string
   */
  private static customFormat(
    date: Date,
    format: string,
    locale: string = "en-US",
    timezone?: string
  ): string {
    const d = timezone
      ? new Date(date.toLocaleString("en-US", { timeZone: timezone }))
      : date;

    const replacements = {
      yyyy: d.getFullYear().toString(),
      yy: d.getFullYear().toString().slice(-2),
      MM: (d.getMonth() + 1).toString().padStart(2, "0"),
      M: (d.getMonth() + 1).toString(),
      dd: d.getDate().toString().padStart(2, "0"),
      d: d.getDate().toString(),
      HH: d.getHours().toString().padStart(2, "0"),
      H: d.getHours().toString(),
      hh: (d.getHours() % 12 || 12).toString().padStart(2, "0"),
      h: (d.getHours() % 12 || 12).toString(),
      mm: d.getMinutes().toString().padStart(2, "0"),
      m: d.getMinutes().toString(),
      ss: d.getSeconds().toString().padStart(2, "0"),
      s: d.getSeconds().toString(),
      fff: d.getMilliseconds().toString().padStart(3, "0"),
      tt: d.getHours() >= 12 ? "PM" : "AM",
    };

    let result = format;
    for (const [token, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(token, "g"), value);
    }

    return result;
  }

  /**
   * Parse date from string
   * @param dateString Date string to parse
   * @returns Date object or null if invalid
   */
  static parse(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * Check if date is valid
   * @param date Date to validate
   * @returns True if valid date
   */
  static isValid(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Add time to date
   * @param date Base date
   * @param amount Amount to add
   * @param unit Time unit
   * @returns New date with added time
   */
  static add(
    date: Date,
    amount: number,
    unit:
      | "milliseconds"
      | "seconds"
      | "minutes"
      | "hours"
      | "days"
      | "weeks"
      | "months"
      | "years"
  ): Date {
    const result = new Date(date);

    switch (unit) {
      case "milliseconds":
        result.setMilliseconds(result.getMilliseconds() + amount);
        break;
      case "seconds":
        result.setSeconds(result.getSeconds() + amount);
        break;
      case "minutes":
        result.setMinutes(result.getMinutes() + amount);
        break;
      case "hours":
        result.setHours(result.getHours() + amount);
        break;
      case "days":
        result.setDate(result.getDate() + amount);
        break;
      case "weeks":
        result.setDate(result.getDate() + amount * 7);
        break;
      case "months":
        result.setMonth(result.getMonth() + amount);
        break;
      case "years":
        result.setFullYear(result.getFullYear() + amount);
        break;
    }

    return result;
  }

  /**
   * Subtract time from date
   * @param date Base date
   * @param amount Amount to subtract
   * @param unit Time unit
   * @returns New date with subtracted time
   */
  static subtract(
    date: Date,
    amount: number,
    unit:
      | "milliseconds"
      | "seconds"
      | "minutes"
      | "hours"
      | "days"
      | "weeks"
      | "months"
      | "years"
  ): Date {
    return this.add(date, -amount, unit);
  }

  /**
   * Calculate difference between two dates
   * @param date1 First date
   * @param date2 Second date
   * @returns Difference object with various units
   */
  static difference(date1: Date, date2: Date): DateDifference {
    const diffMs = Math.abs(date2.getTime() - date1.getTime());

    const years = Math.floor(diffMs / (365.25 * this.MILLISECONDS_PER_DAY));
    const months = Math.floor(diffMs / (30.44 * this.MILLISECONDS_PER_DAY));
    const days = Math.floor(diffMs / this.MILLISECONDS_PER_DAY);
    const hours = Math.floor(
      (diffMs % this.MILLISECONDS_PER_DAY) / this.MILLISECONDS_PER_HOUR
    );
    const minutes = Math.floor(
      (diffMs % this.MILLISECONDS_PER_HOUR) / this.MILLISECONDS_PER_MINUTE
    );
    const seconds = Math.floor(
      (diffMs % this.MILLISECONDS_PER_MINUTE) / this.MILLISECONDS_PER_SECOND
    );
    const milliseconds = diffMs % this.MILLISECONDS_PER_SECOND;

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      totalDays: diffMs / this.MILLISECONDS_PER_DAY,
      totalHours: diffMs / this.MILLISECONDS_PER_HOUR,
      totalMinutes: diffMs / this.MILLISECONDS_PER_MINUTE,
      totalSeconds: diffMs / this.MILLISECONDS_PER_SECOND,
    };
  }

  /**
   * Get start of day
   * @param date Date to process
   * @returns Date at start of day (00:00:00.000)
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day
   * @param date Date to process
   * @returns Date at end of day (23:59:59.999)
   */
  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get start of week (Sunday)
   * @param date Date to process
   * @returns Date at start of week
   */
  static startOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    return this.startOfDay(result);
  }

  /**
   * Get end of week (Saturday)
   * @param date Date to process
   * @returns Date at end of week
   */
  static endOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() + (6 - day));
    return this.endOfDay(result);
  }

  /**
   * Get start of month
   * @param date Date to process
   * @returns Date at start of month
   */
  static startOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setDate(1);
    return this.startOfDay(result);
  }

  /**
   * Get end of month
   * @param date Date to process
   * @returns Date at end of month
   */
  static endOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    return this.endOfDay(result);
  }

  /**
   * Get start of year
   * @param date Date to process
   * @returns Date at start of year
   */
  static startOfYear(date: Date): Date {
    const result = new Date(date);
    result.setMonth(0, 1);
    return this.startOfDay(result);
  }

  /**
   * Get end of year
   * @param date Date to process
   * @returns Date at end of year
   */
  static endOfYear(date: Date): Date {
    const result = new Date(date);
    result.setMonth(11, 31);
    return this.endOfDay(result);
  }

  /**
   * Check if date is today
   * @param date Date to check
   * @returns True if date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  /**
   * Check if date is yesterday
   * @param date Date to check
   * @returns True if date is yesterday
   */
  static isYesterday(date: Date): boolean {
    const yesterday = this.subtract(new Date(), 1, "days");
    return this.isSameDay(date, yesterday);
  }

  /**
   * Check if date is tomorrow
   * @param date Date to check
   * @returns True if date is tomorrow
   */
  static isTomorrow(date: Date): boolean {
    const tomorrow = this.add(new Date(), 1, "days");
    return this.isSameDay(date, tomorrow);
  }

  /**
   * Check if two dates are the same day
   * @param date1 First date
   * @param date2 Second date
   * @returns True if same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Check if date is weekend
   * @param date Date to check
   * @returns True if weekend (Saturday or Sunday)
   */
  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  /**
   * Check if date is weekday
   * @param date Date to check
   * @returns True if weekday (Monday to Friday)
   */
  static isWeekday(date: Date): boolean {
    return !this.isWeekend(date);
  }

  /**
   * Check if year is leap year
   * @param year Year to check
   * @returns True if leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Get days in month
   * @param year Year
   * @param month Month (0-11)
   * @returns Number of days in month
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Get age from birthdate
   * @param birthDate Birth date
   * @param referenceDate Reference date (default: today)
   * @returns Age in years
   */
  static getAge(birthDate: Date, referenceDate: Date = new Date()): number {
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Get timezone information
   * @param date Date to get timezone info for
   * @returns Timezone information object
   */
  static getTimezoneInfo(date: Date = new Date()): TimeZoneInfo {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -date.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetString = `${offset >= 0 ? "+" : "-"}${offsetHours
      .toString()
      .padStart(2, "0")}:${offsetMinutes.toString().padStart(2, "0")}`;

    return {
      timezone,
      offset: offsetString,
      abbreviation: date.toString().match(/\(([A-Za-z\s].*)\)/)?.[1] || "",
    };
  }

  /**
   * Convert date to different timezone
   * @param date Date to convert
   * @param timezone Target timezone
   * @returns Date in target timezone
   */
  static toTimezone(date: Date, timezone: string): Date {
    return new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   * @param date Date to compare
   * @param referenceDate Reference date (default: now)
   * @returns Relative time string
   */
  static getRelativeTime(date: Date, referenceDate: Date = new Date()): string {
    const diff = date.getTime() - referenceDate.getTime();
    const absDiff = Math.abs(diff);
    const isPast = diff < 0;

    const units = [
      { unit: "year", ms: 365.25 * 24 * 60 * 60 * 1000 },
      { unit: "month", ms: 30.44 * 24 * 60 * 60 * 1000 },
      { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
      { unit: "day", ms: 24 * 60 * 60 * 1000 },
      { unit: "hour", ms: 60 * 60 * 1000 },
      { unit: "minute", ms: 60 * 1000 },
      { unit: "second", ms: 1000 },
    ];

    for (const { unit, ms } of units) {
      const value = Math.floor(absDiff / ms);
      if (value > 0) {
        const plural = value === 1 ? "" : "s";
        return isPast
          ? `${value} ${unit}${plural} ago`
          : `in ${value} ${unit}${plural}`;
      }
    }

    return "just now";
  }

  /**
   * Generate date range
   * @param startDate Start date
   * @param endDate End date
   * @param step Step size in days
   * @returns Array of dates in range
   */
  static getDateRange(
    startDate: Date,
    endDate: Date,
    step: number = 1
  ): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + step);
    }

    return dates;
  }

  /**
   * Get week number of the year
   * @param date Date to get week number for
   * @returns Week number (1-53)
   */
  static getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Get quarter of the year
   * @param date Date to get quarter for
   * @returns Quarter number (1-4)
   */
  static getQuarter(date: Date): number {
    return Math.floor((date.getMonth() + 3) / 3);
  }

  /**
   * Check if date is in range
   * @param date Date to check
   * @param startDate Range start date
   * @param endDate Range end date
   * @param inclusive Whether to include boundary dates
   * @returns True if date is in range
   */
  static isInRange(
    date: Date,
    startDate: Date,
    endDate: Date,
    inclusive: boolean = true
  ): boolean {
    if (inclusive) {
      return date >= startDate && date <= endDate;
    } else {
      return date > startDate && date < endDate;
    }
  }

  /**
   * Get nearest date from array
   * @param targetDate Target date
   * @param dates Array of dates to search
   * @returns Nearest date or null if array is empty
   */
  static getNearestDate(targetDate: Date, dates: Date[]): Date | null {
    if (dates.length === 0) return null;

    let nearest = dates[0];
    let minDiff = Math.abs(targetDate.getTime() - nearest.getTime());

    for (let i = 1; i < dates.length; i++) {
      const diff = Math.abs(targetDate.getTime() - dates[i].getTime());
      if (diff < minDiff) {
        minDiff = diff;
        nearest = dates[i];
      }
    }

    return nearest;
  }

  /**
   * Get all dates in month
   * @param year Year
   * @param month Month (0-11)
   * @returns Array of all dates in month
   */
  static getDatesInMonth(year: number, month: number): Date[] {
    const daysInMonth = this.getDaysInMonth(year, month);
    const dates: Date[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }

    return dates;
  }

  /**
   * Get all weekdays in month
   * @param year Year
   * @param month Month (0-11)
   * @param weekday Weekday (0-6, where 0 is Sunday)
   * @returns Array of all specified weekdays in month
   */
  static getWeekdaysInMonth(
    year: number,
    month: number,
    weekday: number
  ): Date[] {
    const dates = this.getDatesInMonth(year, month);
    return dates.filter((date) => date.getDay() === weekday);
  }

  /**
   * Get nth weekday of month
   * @param year Year
   * @param month Month (0-11)
   * @param weekday Weekday (0-6, where 0 is Sunday)
   * @param n Nth occurrence (1-5)
   * @returns Date of nth weekday or null if doesn't exist
   */
  static getNthWeekdayOfMonth(
    year: number,
    month: number,
    weekday: number,
    n: number
  ): Date | null {
    const weekdays = this.getWeekdaysInMonth(year, month, weekday);
    return weekdays[n - 1] || null;
  }

  /**
   * Get last weekday of month
   * @param year Year
   * @param month Month (0-11)
   * @param weekday Weekday (0-6, where 0 is Sunday)
   * @returns Date of last specified weekday in month
   */
  static getLastWeekdayOfMonth(
    year: number,
    month: number,
    weekday: number
  ): Date | null {
    const weekdays = this.getWeekdaysInMonth(year, month, weekday);
    return weekdays[weekdays.length - 1] || null;
  }

  /**
   * Format duration from milliseconds
   * @param milliseconds Duration in milliseconds
   * @param format Format type
   * @returns Formatted duration string
   */
  static formatDuration(
    milliseconds: number,
    format: "short" | "long" | "compact" = "short"
  ): string {
    const duration = this.difference(new Date(0), new Date(milliseconds));

    const parts = [];
    if (duration.days > 0)
      parts.push(
        `${Math.floor(duration.days)}${
          format === "short" ? "d" : format === "compact" ? "d" : " days"
        }`
      );
    if (duration.hours > 0)
      parts.push(
        `${duration.hours}${
          format === "short" ? "h" : format === "compact" ? "h" : " hours"
        }`
      );
    if (duration.minutes > 0)
      parts.push(
        `${duration.minutes}${
          format === "short" ? "m" : format === "compact" ? "m" : " minutes"
        }`
      );
    if (duration.seconds > 0 && duration.days === 0)
      parts.push(
        `${duration.seconds}${
          format === "short" ? "s" : format === "compact" ? "s" : " seconds"
        }`
      );

    if (parts.length === 0) return "0s";

    return format === "compact"
      ? parts.join("")
      : parts.join(format === "short" ? " " : ", ");
  }
}
