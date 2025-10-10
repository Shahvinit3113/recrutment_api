import { BaseEntities } from "./base-entities";

export class UserInfo extends BaseEntities {
  UserId: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Phone: string;
  JoiningDate: Date;
  DateOfBirth: Date;
  Address: string;
  Gender: string;
  ProfileUrl: string;
}
