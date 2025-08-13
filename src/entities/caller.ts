import { Role } from "@/enums/role";

export interface Icaller {
  UserId: string;
  Role: Role;
  Email: string;
}

export class Caller implements Icaller {
  UserId: string;
  Role: Role;
  Email: string;
}
