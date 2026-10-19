import * as vscode from "vscode";
import { GBItem, FunctionCompletion } from "./gbItems";
import { gbBuiltins } from "./gbBuiltins";
import { gbBuiltinsEn } from "./gbBuiltins_en";

export const BASE_URL =
  "https://www-cast3m.cea.fr/index.php?page=notices&notice=";

export function importBuiltins(): Map<string, GBItem> {
  const lang =
    vscode.workspace
      .getConfiguration("gibiane-vscode")
      .get<string>("language") || "fr";

  const isEnglish = lang === "en";
  const sourceBuiltins = isEnglish ? gbBuiltinsEn : gbBuiltins;

  let items = new Map<string, GBItem>();
  for (let builtin of sourceBuiltins) {
    let item = new FunctionCompletion(
      builtin.name,
      builtin.documentation,
      BASE_URL + builtin.url,
      isEnglish
    );
    items.set(builtin.name, item);
  }
  return items;
}
