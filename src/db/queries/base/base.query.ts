import { IBaseEntities } from "@/data/entities/base-entities";

export class BaseQueries<T extends IBaseEntities> {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  getAll(columns?: [keyof T]): string {
    const fields = columns?.length ? columns.join(", ") : "*";
    return `SELECT ${fields} FROM ${this.table} WHERE IsDeleted = 0 AND TenantId = ?`;
  }

  getById(columns?: [keyof T]): string {
    const fields = columns?.length ? columns.join(", ") : "*";
    return `SELECT ${fields} FROM ${this.table} WHERE Uid = ? AND TenantId = ? AND IsDeleted = 0`;
  }

  create(entity: T): string {
    const keys = Object.keys(entity).filter(
      (k) => entity[k as keyof T] !== undefined
    );
    const placeholders = keys.map(() => "?").join(",");
    return `INSERT INTO ${this.table} (${keys.join(
      ","
    )}) VALUES (${placeholders})`;
  }

  update(entity: T): string {
    const keys = Object.keys(entity).filter(
      (k) => k !== "Uid" && entity[k as keyof T] !== undefined
    );
    const setClause = keys.map((k) => `${k} = ?`).join(",");
    return `UPDATE ${this.table} SET ${setClause} WHERE Uid = ?`;
  }

  softDelete(): string {
    return `UPDATE ${this.table} SET IsDeleted = 1 WHERE Uid = ?`;
  }

  hardDelete(): string {
    return `DELETE FROM ${this.table} WHERE Uid = ?`;
  }

  softDeleteMany(): string {
    return `UPDATE ${this.table} SET DeletedOn = ? WHERE Uid IN (?)`;
  }

  hardDeleteMany(): string {
    return `DELETE FROM ${this.table} WHERE Uid IN (?)`;
  }
}
