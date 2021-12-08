import * as vscode from "vscode";

export async function run(args: any) {
  let activeDocumentPath: string =
    vscode.window.activeTextEditor.document.uri.fsPath;

  const scriptCommand: string =
    vscode.workspace
      .getConfiguration("gibiane-vscode")
      .get<string>("Commande") || "";

  if (scriptCommand === "" || typeof scriptCommand === "undefined") {
    vscode.window
      .showErrorMessage(
        "Aucune commande n'a été définie pour exécuter le script.",
        "Configuration"
      )
      .then((choice) => {
        if (choice === "Configuration") {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "@ext:charles-zablit.gibiane-vscode"
          );
        }
      });
    return;
  }

  // Open a terminal window
  let terminals = vscode.window.terminals;
  let terminal;
  // Try to open current terminal window instead of opening a new one.
  if (!terminals) {
    terminal = vscode.window.createTerminal("Script Gibiane");
  } else {
    let found: boolean = false;
    for (let terminal_elt of terminals) {
      if (terminal_elt.name.includes("Script Gibiane")) {
        terminal = terminal_elt;
        found = true;
        break;
      }
    }
    if (!found) {
      terminal = vscode.window.createTerminal("Script Gibiane");
    }
  }
  terminal.show();

  let command: string = scriptCommand + " " + activeDocumentPath;
  terminal.sendText(command);
  return;
}
