import * as vscode from "vscode";

export interface Completion {
  name: string;
  kind: vscode.CompletionItemKind;
  description?: string;

  to_completion_item(): vscode.CompletionItem;
}

export class VariableCompletion implements Completion {
  name: string;
  kind = vscode.CompletionItemKind.Function;

  constructor(
    name: string,
  ) {
    this.name = name;
  }

  to_completion_item(): vscode.CompletionItem {
    return {
      label: this.name,
      kind: this.kind,
      detail: undefined
    };
  }
}