import { UserInfo } from "@/data/entities/user-info";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { Result } from "@/data/response/response";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { UserInfoService } from "@/service/implementation/user-info.service";

@injectable()
@controller("/userinfo", [authenticate])
export class UserInfoController extends BaseController<
  UserInfo,
  UserInfo,
  Filter,
  Result<UserInfo>
> {
  constructor(@inject(TYPES.UserInfoService) userInfoService: UserInfoService) {
    super(userInfoService);
  }
}
