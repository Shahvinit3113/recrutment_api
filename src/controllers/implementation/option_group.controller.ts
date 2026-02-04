import { OptionGroup } from '@/data/entities/option_group';
import { Result } from '@/data/response/response';
import { BaseController } from '../base/base.controller';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { OptionGroupService } from '@/service/implementation/option_group.service';
import { Filter } from '@/data/filters/filter';
import { controller } from '@/core/decorators/controller.decorator';
import { authenticate } from '@/middleware/implementation/auth';
import { initializeCaller } from '@/middleware/implementation/callerInit';
import { OptionGroupVm } from '@/data/models/OptionGroupVm';

@injectable()
@controller('/option-group', [initializeCaller, authenticate])
export class OptionGroupController extends BaseController<
  OptionGroupVm,
  OptionGroup,
  Filter,
  Result<OptionGroup>
> {
  constructor(
    @inject(TYPES.OptionGroupService)
    optionGroupService: OptionGroupService
  ) {
    super(optionGroupService);
  }
}
