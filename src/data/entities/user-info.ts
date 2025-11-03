import { BaseEntities } from "./base-entities";

export class UserInfo extends BaseEntities {
  UserId: string = "";
  Email: string = "";
  FirstName: string = "";
  LastName: string = "";
  Phone: string = "";
  JoiningDate: Date | null = null;
  DateOfBirth: Date | null = null;
  Address: string = "";
  Gender: string = "";
  ProfileUrl: string = "";
}
