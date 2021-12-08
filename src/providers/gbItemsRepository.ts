import {
  CompletionItem,
  Memento,
  Disposable,
  TextDocument,
  Position,
  CompletionList,
  CompletionItemProvider,
  CancellationToken,
  Hover,
} from "vscode";
import { GBItem } from "./gbItems";

export class FileItems {
  completions: Map<string, GBItem>;
  uri: string;
  provideHover: any;

  constructor(uri: string) {
    this.completions = new Map();
    this.uri = uri;
  }

  add(id: string, completion: GBItem) {
    this.completions.set(id, completion);
  }

  get(id: string): GBItem {
    return this.completions.get(id);
  }

  getAllItems(): GBItem[] {
    let items = [];
    for (let item of this.completions.values()) {
      items.push(item);
    }
    return items;
  }
}

export class CompletionRepository
  implements CompletionItemProvider, Disposable
{
  public completions: Map<string, FileItems>;
  private globalState: Memento;

  constructor(globalState?: Memento) {
    this.completions = new Map();
    this.globalState = globalState;
  }

  public provideCompletionItems(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): CompletionList {
    let all_completions_list: CompletionList = new CompletionList();
    all_completions_list.items = this.completions
      .get(document.uri.toString())
      .getAllItems()
      .map((e) => e.toCompletionItem());
    return all_completions_list;
  }

  public provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Hover {
    let range = document.getWordRangeAtPosition(position);
    let word = document.getText(range);
    let completions = this.completions
      .get(document.uri.toString())
      .getAllItems()
      .filter((completion) => {
        return completion.name === word;
      });

    if (completions.length > 0) {
      return completions[0].toHoverItem();
    }
  }

  public dispose() {}
}
