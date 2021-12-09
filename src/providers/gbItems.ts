import {
  CompletionItemKind,
  CompletionItem,
  Hover,
  LocationLink,
  Range,
} from "vscode";
import { URI } from "vscode-uri";

export interface GBItem {
  name: string;
  kind: CompletionItemKind;
  uri?: string;
  range?: Range;
  description?: string;

  toCompletionItem(): CompletionItem;
  toHoverItem(): Hover;
  toDefinitionItem(): LocationLink;
}

export class VariableCompletion implements GBItem {
  name: string;
  kind = CompletionItemKind.Variable;
  description: string;
  range: Range;
  uri: string;

  constructor(name: string, description: string, range: Range, uri: string) {
    this.name = name;
    this.description = description;
    this.range = range;
    this.uri = uri;
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

  toDefinitionItem(): LocationLink {
    return {
      targetRange: this.range,
      targetUri: URI.parse(this.uri),
    };
  }
}

export class FunctionCompletion implements GBItem {
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

  toDefinitionItem(): LocationLink {
    return undefined;
  }
}
