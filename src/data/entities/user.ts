import { Role } from "../enums/role";
import { BaseEntities } from "./base-entities";

export class User extends BaseEntities {
  Role: Role = Role.Unknwon;
  Password: string = "";
  Email: string = "";
}

console.log(new User());
