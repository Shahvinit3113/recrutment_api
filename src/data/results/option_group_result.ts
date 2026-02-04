import { OptionGroup } from "../entities/option_group";
import { Options } from "../entities/options";

export class OptionGroupResult extends OptionGroup {
  Options: Options[] = [];
}
