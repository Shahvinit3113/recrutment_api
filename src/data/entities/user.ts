import { Role } from "../enums/role";
import { BaseEntities, IBaseEntities } from "./base-entities";

export interface IUser extends IBaseEntities {
  Role: Role;
  Password: string;
  Email: string;
}

export class User extends BaseEntities implements IUser {
  Role: Role;
  Password: string;
  Email: string;
}
