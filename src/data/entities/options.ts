import { BaseEntities } from "./base-entities";

export class Options extends BaseEntities {
  OptionGroupId: string = "";
  Name: string = "";
  Value: string = "";
  SortOrder: number = 0;
}
