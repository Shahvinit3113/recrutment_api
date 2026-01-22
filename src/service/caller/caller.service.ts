import { injectable } from "inversify";
import { Caller } from "./caller";
import { Role } from "@/data/enums/role";

@injectable()
export class CallerService {
  private caller: Caller | undefined;

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
      InfoId: caller.InfoId,
    });
  }

  /**
   * Sets an anonymous/public caller for unauthenticated requests
   * Used by public endpoints that don't require authentication
   * Uses special UUID format for anonymous users
   */
  setAnonymousCaller() {
    this.caller = new Caller({
      Email: "anonymous@public",
      Role: Role.Unknwon,
      UserId: "00000000-0000-0000-0000-000000000000",
      TenantId: "00000000-0000-0000-0000-000000000000",
      InfoId: "00000000-0000-0000-0000-000000000000",
    });
  }

  /**
   * @deprecated Use setAnonymousCaller() instead
   */
  setUnknownCaller() {
    this.caller = new Caller({
      Email: "",
      Role: Role.Employee,
      UserId: "0000",
      TenantId: "0000",
      InfoId: "0000",
    });
  }

  /**
   * Checks if the current caller is authenticated (not anonymous)
   */
  get isAuthenticated(): boolean {
    return (
      this.caller != null &&
      this.caller.UserId !== "00000000-0000-0000-0000-000000000000"
    );
  }

  /**
   * Checks if the current caller is anonymous/public
   */
  get isAnonymous(): boolean {
    return !this.isAuthenticated;
  }

  get userId() {
    if (!this.caller) {
      this.setAnonymousCaller();
    }
    return this.caller!.UserId;
  }

  get role() {
    if (!this.caller) {
      this.setAnonymousCaller();
    }
    return this.caller!.Role;
  }

  get mail() {
    if (!this.caller) {
      this.setAnonymousCaller();
    }
    return this.caller!.Email;
  }

  get tenantId() {
    if (!this.caller) {
      this.setAnonymousCaller();
    }
    return this.caller!.TenantId;
  }

  get _caller() {
    if (!this.caller) {
      this.setAnonymousCaller();
    }
    return this.caller!;
  }

  get infoId() {
    return this._caller.InfoId;
  }
}
