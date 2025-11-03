import { BaseEntities } from "./base-entities";

export class Organization extends BaseEntities {
  Name: string = "";
  Description: string = "";
  LogoUrl: string = "";
  Phone: string = "";
  Email: string = "";
  Owner: string = "";
  Address: string = "";
  OrgSite: string = "";
}
