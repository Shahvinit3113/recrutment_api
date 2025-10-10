export interface IBaseEntities {
  Uid: string;
  OrgId: string;
  IsActive: boolean;
  IsDeleted: boolean;
  CreatedOn: Date;
  CreatedBy: string;
  UpdatedOn: Date;
  UpdatedBy: string;
  DeletedOn: Date;
  DeletedBy: string;
}

export class BaseEntities implements IBaseEntities {
  Uid: string;
  OrgId: string;
  IsActive: boolean;
  IsDeleted: boolean;
  CreatedOn: Date;
  CreatedBy: string;
  UpdatedOn: Date;
  UpdatedBy: string;
  DeletedOn: Date;
  DeletedBy: string;
}
