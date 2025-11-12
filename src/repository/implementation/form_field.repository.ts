import { FormField } from "@/data/entities/form_field";
import { BaseRepository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";

export class FormFieldRepository extends BaseRepository<FormField> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.FormField);
  }
}
