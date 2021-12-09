import {
  Memento,
  Disposable,
  TextDocument,
  Position,
  CompletionList,
  CompletionItemProvider,
  CancellationToken,
  Hover,
  Location,
  DefinitionLink,
} from "vscode";
import { GBItem } from "./gbItems";
import { importBuiltins } from "./gbImportBuiltins";

export class FileItems {
  items: Map<string, GBItem>;
  uri: string;
  provideHover: any;

  constructor(uri: string) {
    this.items = importBuiltins();
    this.uri = uri;
  }

  add(id: string, completion: GBItem) {
    this.items.set(id, completion);
  }

  get(id: string): GBItem {
    return this.items.get(id);
  }

  getAllItems(): GBItem[] {
    let items = [];
    for (let item of this.items.values()) {
      items.push(item);
    }
    return items;
  }
}

export class ItemsRepository implements CompletionItemProvider, Disposable {
  public items: Map<string, FileItems>;
  private globalState: Memento;

  constructor(globalState?: Memento) {
    this.items = new Map();
    this.globalState = globalState;
  }

  public provideCompletionItems(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): CompletionList {
    let completionsList: CompletionList = new CompletionList();
    completionsList.items = this.items
      .get(document.uri.toString())
      .getAllItems()
      .map((e) => e.toCompletionItem());
    return completionsList;
  }

  public async provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<Hover> {
    let range = document.getWordRangeAtPosition(position);
    let word = document.getText(range);
    let item = this.items
      .get(document.uri.toString())
      .getAllItems()
      .find((completion) => completion.name === word);

    if (item) {
      return item.toHoverItem();
    }
  }

  public async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<Location | DefinitionLink[]> {
    let range = document.getWordRangeAtPosition(position);
    let word = document.getText(range);
    let items = this.items.get(document.uri.toString()).getAllItems();
    items = items.filter((completion) => completion.name === word);

    if (items.length > 0) {
      return items.map((e) => e.toDefinitionItem());
    }
  }

  public dispose() {}
}
