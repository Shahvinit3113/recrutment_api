import { IBaseEntities } from "@/data/entities/base-entities";

export class BaseQueries<T extends IBaseEntities> {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  seletAllQuery(columns?: (keyof T)[]): string {
    const fields = columns?.length ? columns.join(", ") : "*";
    return `SELECT ${fields} FROM ${this.table} WHERE IsDeleted = 0 AND OrgId = ?`;
  }

  selectByIdQuery(columns?: (keyof T)[]): string {
    const fields = columns?.length ? columns.join(", ") : "*";
    return `SELECT ${fields} FROM ${this.table} WHERE Uid = ? AND OrgId = ? AND IsDeleted = 0`;
  }

  insertQuery(entity: T): string {
    const keys = Object.keys(entity).filter(
      (k) => entity[k as keyof T] !== undefined
    );
    const placeholders = keys.map(() => "?").join(",");
    return `INSERT INTO ${this.table} (${keys.join(
      ","
    )}) VALUES (${placeholders})`;
  }

  putQuery(entity: T): string {
    const keys = Object.keys(entity).filter(
      (k) => k !== "Uid" && entity[k as keyof T] !== undefined
    );
    const setClause = keys.map((k) => `${k} = ?`).join(",");
    return `UPDATE ${this.table} SET ${setClause} WHERE Uid = ?`;
  }

  softDeleteQuery(): string {
    return `UPDATE ${this.table} SET IsDeleted = 1 WHERE Uid = ?`;
  }

  hardDeleteQuery(): string {
    return `DELETE FROM ${this.table} WHERE Uid = ?`;
  }

  softDeleteManyQuery(): string {
    return `UPDATE ${this.table} SET IsDeleted = 1, DeletedOn = ? WHERE Uid IN (?)`;
  }

  hardDeleteManyQuery(): string {
    return `DELETE FROM ${this.table} WHERE Uid IN (?)`;
  }
}
