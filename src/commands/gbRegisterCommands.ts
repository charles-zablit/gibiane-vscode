import { commands, ExtensionContext } from "vscode";
import * as execScriptCommand from "./gbExecuteScript";

export function registerGBCommands(context: ExtensionContext) {
  let execScript = commands.registerCommand(
    "gibiane-vscode.execScript",
    execScriptCommand.run.bind(undefined)
  );
  context.subscriptions.push(execScript);
}
