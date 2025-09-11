import { injectable } from "inversify";
import { Caller } from "./caller";
import { Role } from "@/data/enums/role";

@injectable()
export class CallerService {
  private caller: Caller;
  constructor() {}

  setCaller(caller: Caller) {
    if (caller == null) {
      this.setUnknownCaller();
      return;
    }
    this.caller = caller;
  }

  setUnknownCaller() {
    this.caller = new Caller();
    this.caller.Email = "";
    this.caller.Role = Role.Unknown;
    this.caller.UserId = "0000";
  }

  get UserId() {
    return this.caller.UserId;
  }

  get Role() {
    return this.caller.Role;
  }

  get Email() {
    return this.caller.Email;
  }

  get Caller() {
    return this.caller;
  }
}
