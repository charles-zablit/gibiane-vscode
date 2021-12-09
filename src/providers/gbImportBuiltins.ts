import { GBItem, FunctionCompletion } from "./gbItems";
import { gbBuiltins } from "./gbBuiltins";

export const BASE_URL =
  "http://www-cast3m.cea.fr/index.php?page=notices&notice=";

export function importBuiltins(): Map<string, GBItem> {
  let items = new Map<string, GBItem>();
  for (let builtin of gbBuiltins) {
    let item = new FunctionCompletion(
      builtin.name,
      builtin.documentation,
      BASE_URL + builtin.url
    );
    items.set(builtin.name, item);
  }
  return items;
}
