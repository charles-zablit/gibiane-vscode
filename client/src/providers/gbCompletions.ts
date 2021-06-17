import * as vscode from "vscode";
import { Completion } from "./gbCompletionsKind";
import { provideHover } from "./gbHover";

export class FileCompletions {
  completions: Map<string, Completion>;
  uri: string;
  provideHover: any;

  constructor(uri: string) {
    this.completions = new Map();
    this.uri = uri;
    this.provideHover = provideHover;
  }

  add(id: string, completion: Completion) {
    this.completions.set(id, completion);
  }

  get(id: string): Completion {
    return this.completions.get(id);
  }

  get_completions_raw(): Completion[] {
    let completions = [];
    for (let completion of this.completions.values()) {
      completions.push(completion);
    }
    return completions;
  }

  get_completions(): vscode.CompletionItem[] {
    let completions = [];
    for (let completion of this.completions.values()) {
      completions.push(completion.to_completion_item());
    }
    return completions;
  }
}

export class CompletionRepository
  implements vscode.CompletionItemProvider, vscode.Disposable
{
  public completions: Map<string, FileCompletions>;
  private globalState: vscode.Memento;

  constructor(globalState?: vscode.Memento) {
    this.completions = new Map();
    this.globalState = globalState;
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.CompletionList {
    let all_completions_list: vscode.CompletionList =
      new vscode.CompletionList();
    all_completions_list.items = this.completions
      .get(document.uri.toString())
      .get_completions();
    return all_completions_list;
  }

  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.Hover {
    let range = document.getWordRangeAtPosition(position);
    let word = document.getText(range);
    let completions = this.completions
      .get(document.uri.toString())
      .get_completions_raw()
      .filter((completion) => {
        return completion.name === word;
      });

    if (completions.length > 0) {
      return completions[0].get_hover();
    }
  }

  public dispose() {}
}
