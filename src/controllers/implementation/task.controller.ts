import { Task } from "@/data/entities/task";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { Result } from "@/data/response/response";
import { inject, injectable } from "inversify";
import { controller } from "@/core/decorators/controller.decorator";
import { authenticate } from "@/middleware/implementation/auth";
import { TYPES } from "@/core/container/types";
import { TaskService } from "@/service/implementation/task.service";

@injectable()
@controller("/task", [authenticate])
export class TaskController extends BaseController<
  Task,
  Task,
  Filter,
  Result<Task>
> {
  constructor(@inject(TYPES.TaskService) taskService: TaskService) {
    super(taskService);
  }
}
