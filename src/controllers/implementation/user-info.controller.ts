import { UserInfo } from "@/data/entities/user-info";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { inject, injectable } from "inversify";
import { TYPES } from "@/core/container/types";
import { Result } from "@/data/response/response";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { initializeCaller } from "@/middleware/implementation/callerInit";
import { UserInfoService } from "@/service/implementation/user-info.service";
import { Get } from "@/core/decorators/route.decorator";
import { Request, Response } from "express";
import { Response as ApiResponse } from "@/data/response/response";

@injectable()
@controller("/userinfo", [initializeCaller, authenticate])
export class UserInfoController extends BaseController<
  UserInfo,
  UserInfo,
  Filter,
  Result<UserInfo>
> {
  //#region Service Intialization
  private readonly _userInfoService: UserInfoService;
  //#endregion

  constructor(@inject(TYPES.UserInfoService) userInfoService: UserInfoService) {
    super(userInfoService);
    this._userInfoService = userInfoService;
  }

  @Get("/profile/details")
  async getUserDetails(
    req: Request<any, Result<UserInfo>, any, any>,
    res: Response<ApiResponse<Result<UserInfo>>>,
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._userInfoService.getUserDetails(),
      ),
    );
  }
}
