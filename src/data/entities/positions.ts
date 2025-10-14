import { PositionStatus } from "../enums/positionStatus";
import { BaseEntities } from "./base-entities";

export class Positions extends BaseEntities {
  Name: string;
  Description: string;
  Status: PositionStatus;
  DepartmentId: string;
}
