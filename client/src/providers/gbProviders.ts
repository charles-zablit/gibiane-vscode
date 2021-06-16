import * as vscode from "vscode";
import * as gbCompletions from "./gbCompletions";
import * as gbParser from "./gbParser";
import { URI } from "vscode-uri";
import * as gbDefinitions from "./gbDefinitions";

export class Providers {
  completionsProvider: gbCompletions.CompletionRepository;
  definitions: gbDefinitions.DefinitionRepository;

  constructor(globalState?: vscode.Memento) {
    this.completionsProvider = new gbCompletions.CompletionRepository(
      globalState
    );
    this.definitions = new gbDefinitions.DefinitionRepository(globalState);
  }

  public handle_new_document(document: vscode.TextDocument) {
    this.documentEditCallback(document.uri.toString());
  }

  public handle_added_document(event: vscode.FileCreateEvent): any {
    for (let file of event.files) {
      this.documentEditCallback(URI.file(file.fsPath).toString());
    }
  }

  public handle_document_change(event: vscode.TextDocumentChangeEvent) {
    let uri = event.document.uri;
    let this_completions: gbCompletions.FileCompletions =
      new gbCompletions.FileCompletions(uri.toString());
    try {
      gbParser.parse_text(
        event.document.getText(),
        this_completions,
        this.definitions.Definitions,
        uri.toString()
      );
    } catch (error) {
      console.log(error);
    }
    this.completionsProvider.completions.set(
      event.document.uri.toString(),
      this_completions
    );
  }

  public documentEditCallback(uri: string, text: string = undefined): void {
    {
      let this_completions: gbCompletions.FileCompletions =
        new gbCompletions.FileCompletions(uri);
      if (typeof text != undefined) {
        try {
          gbParser.parse_text(
            text,
            this_completions,
            this.definitions.Definitions,
            uri
          );
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          gbParser.parse_file(
            URI.parse(uri).fsPath,
            this_completions,
            this.definitions.Definitions
          );
        } catch (error) {
          console.error(error);
        }
      }

      this.completionsProvider.completions.set(uri, this_completions);
    }
  }
}
