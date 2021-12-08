import { CompletionItemKind, CompletionItem, Hover } from "vscode";

export interface Completion {
  name: string;
  kind: CompletionItemKind;
  description?: string;

  toCompletionItem(): CompletionItem;
  toHoverItem(): Hover;
}

export class VariableCompletion implements Completion {
  name: string;
  kind = CompletionItemKind.Function;
  description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  toCompletionItem(): CompletionItem {
    return {
      label: this.name,
      kind: this.kind,
      detail: this.description,
    };
  }

  toHoverItem(): Hover {
    if (this.description != "") {
      return new Hover({ language: "gibiane", value: this.description });
    }
  }
}
