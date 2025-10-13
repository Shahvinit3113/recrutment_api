import { Task } from "@/data/entities/task";
import { BaseQueries } from "./base/base.query";
import { Tables } from "../helper/table";

export class TaskQuery extends BaseQueries<Task> {
  constructor() {
    super(Tables.Task);
  }
}
