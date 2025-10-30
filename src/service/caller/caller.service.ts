import { injectable } from "inversify";
import { Caller } from "./caller";
import { Role } from "@/data/enums/role";

@injectable()
export class CallerService {
  private caller: Caller;

  setCaller(caller: Caller) {
    if (caller == null || typeof caller == "undefined") {
      this.setUnknownCaller();
      return;
    }
    this.caller = new Caller({
      Email: caller.Email,
      UserId: caller.UserId,
      Role: caller.Role,
      TenantId: caller.TenantId,
    });
  }

  setUnknownCaller() {
    this.caller = new Caller({
      Email: "",
      Role: Role.Employee,
      UserId: "0000",
      TenantId: "0000",
    });
  }

  get userId() {
    return this.caller.UserId;
  }

  get role() {
    return this.caller.Role;
  }

  get mail() {
    return this.caller.Email;
  }

  get tenantId() {
    return this.caller.TenantId;
  }

  get _caller() {
    return this.caller;
  }
}
