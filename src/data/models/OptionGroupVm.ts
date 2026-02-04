/**
 * View Model for Option within an OptionGroup
 */
export class OptionVm {
  Uid?: string;
  Name: string = '';
  Value: string = '';
  SortOrder: number = 0;
  IsActive?: boolean;
}

/**
 * View Model for OptionGroup with nested Options
 * Used for create and update operations
 */
export class OptionGroupVm {
  Uid?: string;
  Name: string = '';
  Description: string | null = null;
  IsActive?: boolean;
  Options: OptionVm[] = [];
}
