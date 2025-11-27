import { Utility } from "@/core/utils/common.utils";

export class BaseEntities {
  Uid: string = Utility.generateUUID();
  OrgId: string = "";
  IsActive: boolean = true;
  IsDeleted: boolean = false;
  CreatedOn: Date = new Date();
  CreatedBy: string = "";
  UpdatedOn: Date | null = null;
  UpdatedBy: string | null = null;
  DeletedOn: Date | null = null;
}
