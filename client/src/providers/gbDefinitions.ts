import * as vscode from "vscode";
import { URI } from "vscode-uri";

export type Definitions = Map<string, DefLocation>;

export enum DefinitionKind {
  Variable = 0,
}

export class DefLocation extends vscode.Location {
  type: DefinitionKind;
  scope: string;

  constructor(uri: URI, range: vscode.Range, type: DefinitionKind) {
    super(uri, range);
    this.type = type;
  }
}

export class DefinitionRepository
  implements vscode.DefinitionProvider, vscode.Disposable
{
  public Definitions: Definitions;
  private globalState: vscode.Memento;

  constructor(globalState?: vscode.Memento) {
    this.Definitions = new Map();
    this.globalState = globalState;
  }

  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.Location | vscode.DefinitionLink[] {
    let range = document.getWordRangeAtPosition(position);
    let word: string = document.getText(range);
    let definition: DefLocation;
    definition = this.Definitions.get(word);
    if (typeof definition != "undefined") {
      return new vscode.Location(definition.uri, definition.range);
    }
  }

  public dispose() {}
}
