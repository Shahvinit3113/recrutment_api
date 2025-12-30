import { Task } from "@/data/entities/task";
import { BaseController } from "../base/base.controller";
import { Filter } from "@/data/filters/filter";
import { inject } from "inversify";
import { authenticate } from "@/middleware/implementation/auth";
import { TYPES } from "@/core/container/types";
import { TaskService } from "@/service/implementation/task.service";
import { AutoController } from "@/core/container/auto-register";

@AutoController("/task", [authenticate])
export class TaskController extends BaseController<Task, Task, Filter> {
  constructor(@inject(TYPES.TaskService) taskService: TaskService) {
    super(taskService);
  }
}
