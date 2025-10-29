import { Task } from "@/data/entities/task";
import { DatabaseConnection } from "@/db/connection/connection";
import { BaseRepository } from "../base/base.repository";
import { Tables } from "@/db/helper/table";

export class TaskRepository extends BaseRepository<Task> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.Task);
  }
}
