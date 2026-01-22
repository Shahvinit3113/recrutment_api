import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { initializeCaller } from "@/middleware/implementation/callerInit";
import { TYPES } from "@/core/container/types";
import { FormField } from "@/data/entities/form_field";
import { FormFieldService } from "@/service/implementation/form_field.service";
import { Post } from "@/core/decorators/route.decorator";
import { Request, Response } from "express";
import { Response as ApiResponse } from "@/data/response/response";

@injectable()
@controller("/formField", [initializeCaller, authenticate])
export class FormFieldController extends BaseController<
  FormField,
  FormField,
  Filter,
  Result<FormField>
> {
  private readonly _formFieldService;

  constructor(
    @inject(TYPES.FormFieldService) formFieldService: FormFieldService,
  ) {
    super(formFieldService);
    this._formFieldService = formFieldService;
  }

  /**
   * Upsert multiple form fields
   * @param req
   * @param res
   * @returns
   */
  @Post("/upsert")
  async upsertFormFields(
    req: Request<any, any, FormField[], any>,
    res: Response<ApiResponse<Result<FormField[]>>>,
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Record updated successfully",
        await this._formFieldService.upsertMultipleFormFields(req.body),
      ),
    );
  }
}
