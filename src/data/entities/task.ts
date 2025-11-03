import { BaseEntities } from "./base-entities";

export class Task extends BaseEntities {
  Name: string = "";
  Description: string = "";
  UserName: string = "";
  Stack: "Web" | "API" | "Db" = "Web";
  StartDate: Date = new Date();
  EndDate: Date = new Date();
  Status: "Completed" | "Active" | "Hold" | "Canceled" = "Active";
}
