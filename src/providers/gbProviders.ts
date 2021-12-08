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
  completionsProvider: ItemsRepository;

  constructor(globalState?: Memento) {
    this.completionsProvider = new ItemsRepository(globalState);
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
    let this_completions: FileItems = new FileItems(uri.toString());
    try {
      parseText(event.document.getText(), this_completions, uri.toString());
    } catch (error) {
      console.log(error);
    }
    this.completionsProvider.items.set(
      event.document.uri.toString(),
      this_completions
    );
  }

  public documentEditCallback(uri: string, text: string = undefined): void {
    {
      let this_completions: FileItems = new FileItems(uri);
      if (typeof text != "undefined") {
        try {
          parseText(text, this_completions, uri);
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          parseFile(URI.parse(uri).fsPath, this_completions);
        } catch (error) {
          console.error(error);
        }
      }

      this.completionsProvider.items.set(uri, this_completions);
    }
  }
}
