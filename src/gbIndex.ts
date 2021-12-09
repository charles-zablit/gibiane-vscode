import {
  ExtensionContext,
  workspace as Workspace,
  languages,
  DocumentFilter,
} from "vscode";
import { Providers } from "./providers/gbProviders";
import { registerGBCommands } from "./commands/gbRegisterCommands";
import { extname } from "path";
import { SemanticTokensLegend } from "vscode";

export const GB_LEGENDS = new SemanticTokensLegend(
  ["variable"],
  ["declaration"]
);

const GB_MODE: DocumentFilter = {
  language: "gibiane",
  scheme: "file",
};

export function activate(context: ExtensionContext) {
  const providers = new Providers(context.globalState);

  context.subscriptions.push(
    languages.registerCompletionItemProvider(GB_MODE, providers.itemsRepository)
  );

  context.subscriptions.push(
    languages.registerDefinitionProvider(GB_MODE, providers.itemsRepository)
  );

  context.subscriptions.push(
    languages.registerHoverProvider(GB_MODE, providers.itemsRepository)
  );

  context.subscriptions.push(
    languages.registerDocumentSemanticTokensProvider(
      GB_MODE,
      providers.itemsRepository,
      GB_LEGENDS
    )
  );

  Workspace.onDidChangeTextDocument(
    providers.handle_document_change,
    providers,
    context.subscriptions
  );

  Workspace.onDidOpenTextDocument(
    providers.handle_new_document,
    providers,
    context.subscriptions
  );

  Workspace.onDidCreateFiles(
    providers.handle_added_document,
    providers,
    context.subscriptions
  );

  for (let document of Workspace.textDocuments) {
    if (extname(document.uri.fsPath) == ".dgibi") {
      providers.handle_new_document(document);
    }
  }

  //Register the commands
  registerGBCommands(context);
}
