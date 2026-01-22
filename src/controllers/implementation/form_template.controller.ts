import { FormTemplate } from "@/data/entities/form_template";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { Result, Response as ApiResponse } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { initializeCaller } from "@/middleware/implementation/callerInit";
import { TYPES } from "@/core/container/types";
import { FormTemplateService } from "@/service/implementation/form_template.service";
import { FormTemplateResult } from "@/data/results/form_template_result";
import { Request, Response } from "express";
import { Get } from "@/core/decorators/route.decorator";
import { Public } from "@/core/decorators/public.decorator";

@injectable()
@controller("/formTemplate", [initializeCaller, authenticate])
export class FormTemplateController extends BaseController<
  FormTemplate,
  FormTemplate,
  Filter,
  Result<FormTemplateResult>
> {
  //#region Service Initialization
  private readonly _formTemplateService: FormTemplateService;
  //#endregion

  constructor(
    @inject(TYPES.FormTemplateService) formTemplateService: FormTemplateService,
  ) {
    super(formTemplateService);
    this._formTemplateService = formTemplateService;
  }

  /**
   * Get form template by id for public access
   * @param req
   * @param res
   * @returns
   */
  @Public()
  @Get("/public/:orgId/:templateId")
  async getFormTemplateByIdForPublic(
    req: Request<{ orgId: string; templateId: string }>,
    res: Response<ApiResponse<Result<FormTemplateResult>>>,
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Success",
        await this._formTemplateService.getFormTemplateByIdForPublic(
          req.params.templateId,
          req.params.orgId,
        ),
      ),
    );
  }
}
