import { FormSection } from "@/data/entities/form_section";
import { BaseRepository } from "../base/base.repository";
import { DatabaseConnection } from "@/db/connection/connection";
import { Tables } from "@/db/helper/table";

export class FormSectionRepository extends BaseRepository<FormSection> {
  constructor(db: DatabaseConnection) {
    super(db, Tables.FormSection);
  }
}
