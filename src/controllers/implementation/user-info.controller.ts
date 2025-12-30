import { UserInfo } from "@/data/entities/user-info";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { inject } from "inversify";
import { TYPES } from "@/core/container/types";
import { SingleResult } from "@/data/response/response";
import { authenticate } from "@/middleware/implementation/auth";
import { UserInfoService } from "@/service/implementation/user-info.service";
import { Get } from "@/core/decorators/route.decorator";
import { Request, Response } from "express";
import { Response as ApiResponse } from "@/data/response/response";
import { AutoController } from "@/core/container/auto-register";

@AutoController("/userinfo", [authenticate])
export class UserInfoController extends BaseController<UserInfo, UserInfo, Filter> {
  //#region Service Intialization
  private readonly _userInfoService: UserInfoService;
  //#endregion

  constructor(@inject(TYPES.UserInfoService) userInfoService: UserInfoService) {
    super(userInfoService);
    this._userInfoService = userInfoService;
  }

  @Get("/profile/details")
  async getUserDetails(
    req: Request<any, SingleResult<UserInfo>, any, any>,
    res: Response<ApiResponse<SingleResult<UserInfo>>>
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._userInfoService.getUserDetails()
      )
    );
  }
}
