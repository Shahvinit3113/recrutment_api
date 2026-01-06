import { BaseEntities } from "./base-entities";

export class Application extends BaseEntities {
  Name: string = "";
  Email: string = "";
  Phone: string = "";
  Experience: string = "";
  PositionId: string = "";
  ResumeUrl: string | null = null;
  CurrentSalary: number | null = null;
  ExpectedSalary: number | null = null;
  NoticePeriod: number | null = null;
}
