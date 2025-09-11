import { BaseEntities, IBaseEntities } from "./base-entities";

export interface IGym extends IBaseEntities {
  Name: string;
  Address: string;
  Phone: string;
  Email: string;
  Description?: string;
  IsActive: boolean;
}

export class Gym extends BaseEntities implements IGym {
  Name: string;
  Address: string;
  Phone: string;
  Email: string;
  Description?: string;
  IsActive: boolean;
}
