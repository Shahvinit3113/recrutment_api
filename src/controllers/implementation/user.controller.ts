import { User } from "@/data/entities/user";
import { Result } from "@/data/response/response";
import { BaseController } from "../base/base.controller";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { UserService } from "@/service/implementation/user.service";
import { Filter } from "@/data/filters/filter";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { initializeCaller } from "@/middleware/implementation/callerInit";

@injectable()
@controller("/user", [initializeCaller, authenticate])
export class UserController extends BaseController<
  User,
  User,
  Filter,
  Result<User>
> {
  constructor(@inject(TYPES.UserService) userService: UserService) {
    super(userService);
  }
}
