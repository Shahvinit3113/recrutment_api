import { User } from "@/data/entities/user";
import { BaseController } from "../base/base.controller";
import { inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { UserService } from "@/service/implementation/user.service";
import { Filter } from "@/data/filters/filter";
import { authenticate } from "@/middleware/implementation/auth";
import { AutoController } from "@/core/container/auto-register";

@AutoController("/user", [authenticate])
export class UserController extends BaseController<User, User, Filter> {
  constructor(@inject(TYPES.UserService) userService: UserService) {
    super(userService);
  }
}
