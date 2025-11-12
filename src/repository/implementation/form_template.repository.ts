import { FormTemplate } from "@/data/entities/form-template";
import { BaseRepository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";

export class FormTemplateRepository extends BaseRepository<FormTemplate> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.FormTemplate);
  }
}
