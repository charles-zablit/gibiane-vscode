import * as vscode from "vscode";
import { Completion } from "./gbCompletionsKind";

export class FileCompletions {
  completions: Map<string, Completion>;
  uri: string;

  constructor(uri: string) {
    this.completions = new Map();
    this.uri = uri;
  }

  add(id: string, completion: Completion) {
    this.completions.set(id, completion);
  }

  get(id: string): Completion {
    return this.completions.get(id);
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

  public dispose() {}
}
