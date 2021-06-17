import * as vscode from "vscode";

export function provideHover(
	document: vscode.TextDocument,
	position: vscode.Position,
	token: vscode.CancellationToken
): vscode.Hover {
	let range = document.getWordRangeAtPosition(position);
	let word = document.getText(range);
	let completions = this.completions.get(document.uri.toString()).get_completions().filter(
		(completion) => {
			return completion.name === word;
		}
	);

	if (completions.length > 0) {
		return completions[0].get_hover();
	}
}