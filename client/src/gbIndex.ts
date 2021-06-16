import {
  ExtensionContext,
  workspace as Workspace,
  languages,
  window,
  WorkspaceFolder,
  DocumentFilter,
} from "vscode";

import { Providers } from "./providers/gbProviders";

const GB_MODE: DocumentFilter = {
  language: "gibiane",
  scheme: "file",
};

export function activate(context: ExtensionContext) {
  const providers = new Providers(context.globalState);
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      GB_MODE,
      providers.completionsProvider
    )
  );
  context.subscriptions.push(
    languages.registerDefinitionProvider(GB_MODE, providers.definitions)
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
}
