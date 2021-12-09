import { GBItem, FunctionCompletion } from "./gbItems";
import { gbBuiltins } from "./gbBuiltins";

export function importBuiltins(): Map<string, GBItem> {
  let items = new Map<string, GBItem>();
  for (let builtin of gbBuiltins) {
    let item = new FunctionCompletion(builtin.name, builtin.documentation);
    items.set(builtin.name, item);
  }
  return items;
}
