import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { SingleResult } from "@/data/response/response";
import { inject } from "inversify";
import { authenticate } from "@/middleware/implementation/auth";
import { TYPES } from "@/core/container/types";
import { FormField } from "@/data/entities/form_field";
import { FormFieldService } from "@/service/implementation/form_field.service";
import { Post } from "@/core/decorators/route.decorator";
import { Response } from "express";
import { Response as ApiResponse } from "@/data/response/response";
import { AutoController } from "@/core/container/auto-register";
import { BodyRequest } from "@/core/types/express";

@AutoController("/formField", [authenticate])
export class FormFieldController extends BaseController<FormField, FormField, Filter> {
  private readonly _formFieldService;

  constructor(
    @inject(TYPES.FormFieldService) formFieldService: FormFieldService
  ) {
    super(formFieldService);
    this._formFieldService = formFieldService;
  }

  @Post("/upsert")
  async upsertFormFields(
    req: BodyRequest<FormField[]>,
    res: Response<ApiResponse<SingleResult<FormField[]>>>
  ) {
    return res.send(
      new ApiResponse(
        true,
        200,
        "Record updated successfully",
        await this._formFieldService.upsertMultipleFormFields(req.body)
      )
    );
  }
}
