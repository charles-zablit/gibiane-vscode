import * as vscode from "vscode";

export interface Completion {
  name: string;
  kind: vscode.CompletionItemKind;
  description?: string;

  to_completion_item(): vscode.CompletionItem;
	get_hover(): vscode.Hover;
}

export class VariableCompletion implements Completion {
  name: string;
  kind = vscode.CompletionItemKind.Function;
	description: string;

  constructor(
    name: string,
		description: string
  ) {
    this.name = name;
		this.description = description;
  }

  to_completion_item(): vscode.CompletionItem {
    return {
      label: this.name,
      kind: this.kind,
      detail: this.description
    };
  }

	get_hover(): vscode.Hover {
    if (this.description != "") {
      return new vscode.Hover({ language: "gibiane", value: this.description });
    }
  }
}