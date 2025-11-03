export class BaseEntities {
  Uid: string = "";
  OrgId: string = "";
  IsActive: boolean = true;
  IsDeleted: boolean = false;
  CreatedOn: Date = new Date();
  CreatedBy: string = "";
  UpdatedOn: Date | null = null;
  UpdatedBy: string | null = null;
  DeletedOn: Date | null = null;
  DeletedBy: string | null = null;
}
