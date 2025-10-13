import { BaseEntities } from "./base-entities";

export class Task extends BaseEntities {
  Name: string;
  Description: string;
  UserName: string;
  Stack: "Web" | "API" | "Db";
  StartDate: Date;
  EndDate: Date;
  Status: "Completed" | "Active" | "Hold" | "Canceled";
}
