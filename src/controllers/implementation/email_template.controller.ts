import { EmailTemplate } from '@/data/entities/email_template';
import { Result } from '@/data/response/response';
import { BaseController } from '../base/base.controller';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/container/types';
import { EmailTemplateService } from '@/service/implementation/email_template.service';
import { Filter } from '@/data/filters/filter';
import { controller } from '@/core/decorators/controller.decorator';
import { authenticate } from '@/middleware/implementation/auth';
import { initializeCaller } from '@/middleware/implementation/callerInit';

@injectable()
@controller('/email-template', [initializeCaller, authenticate])
export class EmailTemplateController extends BaseController<
  EmailTemplate,
  EmailTemplate,
  Filter,
  Result<EmailTemplate>
> {
  constructor(
    @inject(TYPES.EmailTemplateService)
    emailTemplateService: EmailTemplateService
  ) {
    super(emailTemplateService);
  }
}
