import { Tables } from "./tables";

export interface TQueries {
  getAll: () => string;
  getById: () => string;
  create: (obj: any) => string;
  update: (obj: any) => string;
  delete: () => string;
  [k: string]: (...args: any[]) => string;
}

export default class DbQueries {
  //#region User
  static User: TQueries = {
    getAll: () =>
      `SELECT * FROM ${Tables.User} WHERE IsDeleted = 0 AND TenantId = ?`,
    getById: () =>
      `SELECT * FROM ${Tables.User} WHERE Uid = ? AND IsDeleted = 0 AND TenantId = ?`,

    create: (obj: any) =>
      `INSERT INTO ${Tables.User} (${Object.keys(obj).join(
        ", "
      )}) VALUES (${Object.keys(obj)
        .map(() => "? ")
        .join(", ")})`,

    update: (obj: any) =>
      `UPDATE ${Tables.User} SET ${Object.keys(obj)
        .filter((key) => key !== "Uid")
        .map((key) => `${key} = ?`)
        .join(", ")} WHERE Uid = ?`,

    delete: () =>
      `UPDATE ${Tables.User} SET IsDeleted = 1, DeletedOn = NOW() WHERE Uid = ? AND TenantId = ?`,
    getByEmail: () =>
      `SELECT * FROM ${Tables.User} WHERE Email = ? AND IsDeleted = 0 AND TenantId = ?`,
  };

  //#region Trainer
  static Trainer: TQueries = {
    getAll: () =>
      `SELECT * FROM ${Tables.Trainers} WHERE IsDeleted = 0 AND TenantId = ?`,
    getById: () =>
      `SELECT * FROM ${Tables.Trainers} WHERE Uid = ? AND IsDeleted = 0 AND TenantId = ?`,

    create: (obj: any) =>
      `INSERT INTO ${Tables.Trainers} (${Object.keys(obj).join(
        ", "
      )}) VALUES (${Object.keys(obj)
        .map(() => "? ")
        .join(", ")})`,

    update: (obj: any) =>
      `UPDATE ${Tables.Trainers} SET ${Object.keys(obj)
        .filter((key) => key !== "Uid")
        .map((key) => `${key} = ?`)
        .join(", ")} WHERE Uid = ?`,

    delete: () =>
      `UPDATE ${Tables.Trainers} SET IsDeleted = 1, DeletedOn = NOW() WHERE Uid = ? AND TenantId = ?`,
    getByEmail: () =>
      `SELECT * FROM ${Tables.Trainers} WHERE Email = ? AND IsDeleted = 0 AND TenantId = ?`,
  };

  //#region Gym
  static Gym: TQueries = {
    getAll: () =>
      `SELECT * FROM ${Tables.Gym} WHERE IsDeleted = 0 AND TenantId = ?`,
    getById: () =>
      `SELECT * FROM ${Tables.Gym} WHERE Uid = ? AND IsDeleted = 0 AND TenantId = ?`,

    create: (obj: any) =>
      `INSERT INTO ${Tables.Gym} (${Object.keys(obj).join(
        ", "
      )}) VALUES (${Object.keys(obj)
        .map(() => "? ")
        .join(", ")})`,

    update: (obj: any) =>
      `UPDATE ${Tables.Gym} SET ${Object.keys(obj)
        .filter((key) => key !== "Uid")
        .map((key) => `${key} = ?`)
        .join(", ")} WHERE Uid = ?`,

    delete: () =>
      `UPDATE ${Tables.Gym} SET IsDeleted = 1, DeletedOn = NOW() WHERE Uid = ? AND TenantId = ?`,
    getByName: () =>
      `SELECT * FROM ${Tables.Gym} WHERE Name = ? AND IsDeleted = 0 AND TenantId = ?`,
    getByEmail: () =>
      `SELECT * FROM ${Tables.Gym} WHERE Email = ? AND IsDeleted = 0 AND TenantId = ?`,
  };
}
