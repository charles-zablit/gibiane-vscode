import {
  TextDocument,
  Memento,
  FileCreateEvent,
  TextDocumentChangeEvent,
} from "vscode";
import { ItemsRepository, FileItems } from "./gbItemsRepository";
import { parseText, parseFile } from "./gbParser";
import { URI } from "vscode-uri";

export class Providers {
  itemsRepository: ItemsRepository;

  constructor(globalState?: Memento) {
    this.itemsRepository = new ItemsRepository(globalState);
  }

  public handle_new_document(document: TextDocument) {
    this.documentEditCallback(document.uri.toString());
  }

  public handle_added_document(event: FileCreateEvent): any {
    for (let file of event.files) {
      this.documentEditCallback(URI.file(file.fsPath).toString());
    }
  }

  public handle_document_change(event: TextDocumentChangeEvent) {
    let uri = event.document.uri;
    let items: FileItems = new FileItems(uri.toString());
    try {
      parseText(event.document.getText(), items, uri.toString());
    } catch (error) {
      console.log(error);
    }
    this.itemsRepository.items.set(event.document.uri.toString(), items);
  }

  public documentEditCallback(uri: string, text: string = undefined): void {
    {
      let items: FileItems = new FileItems(uri);
      if (typeof text != "undefined") {
        try {
          parseText(text, items, uri);
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          parseFile(URI.parse(uri).fsPath, items);
        } catch (error) {
          console.error(error);
        }
      }

      this.itemsRepository.items.set(uri, items);
    }
  }
}
