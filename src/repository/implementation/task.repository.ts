import { Task } from "@/data/entities/task";
import { BaseRespository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { TaskQuery } from "@/db/queries/task.query";

export class TaskRepository extends BaseRespository<Task, TaskQuery> {
  constructor(db: DatabaseConnection) {
    super(db, new TaskQuery());
  }
}
