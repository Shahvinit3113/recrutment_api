import { Options } from '@/data/entities/options';
import { Result } from '@/data/response/response';
import { BaseController } from '../base/base.controller';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { OptionsService } from '@/service/implementation/options.service';
import { Filter } from '@/data/filters/filter';
import { controller } from '@/core/decorators/controller.decorator';
import { authenticate } from '@/middleware/implementation/auth';
import { initializeCaller } from '@/middleware/implementation/callerInit';

@injectable()
@controller('/options', [initializeCaller, authenticate])
export class OptionsController extends BaseController<
  Options,
  Options,
  Filter,
  Result<Options>
> {
  constructor(
    @inject(TYPES.OptionsService)
    optionsService: OptionsService
  ) {
    super(optionsService);
  }
}
