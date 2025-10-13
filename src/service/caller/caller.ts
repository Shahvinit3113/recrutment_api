import { Role } from "@/data/enums/role";

export class Caller {
  UserId: string;
  Email: string;
  Role: Role;
  TenantId: string;

  constructor(caller?: Caller) {
    if (caller) {
      this.UserId = caller.UserId;
      this.Email = caller.Email;
      this.Role = caller.Role;
      this.TenantId = caller.TenantId;
    }
  }
}
