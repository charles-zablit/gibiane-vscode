import { CompletionItem, CompletionItemKind, Location, Range } from "vscode";
import { FileItems } from "./gbItemsRepository";
import { readFileSync } from "fs";
import { VariableCompletion } from "./gbItems";
import { URI } from "vscode-uri";

export function parseFile(uri: string, completions: FileItems) {
  let data = readFileSync(URI.parse(uri).fsPath, "utf-8");
  parseText(data, completions, uri);
}

export function parseText(data: string, items: FileItems, uri: string) {
  if (typeof data === "undefined") {
    return; // Asked to parse an empty file
  }
  let lines = data.split("\n");
  let parser = new Parser(lines, items, uri);
  parser.parse();
}

class Parser {
  items: FileItems;
  lines: string[];
  lineNb: number;
  uri: string;

  constructor(lines: string[], items: FileItems, uri: string) {
    this.items = items;
    this.uri = uri;
    this.lineNb = -1;
    this.lines = lines;
  }

  parse() {
    let line: string;
    line = this.lines[0];
    while (typeof line != "undefined") {
      this.interpLine(line);
      line = this.lines.shift();
      this.lineNb++;
    }
  }

  interpLine(line: string) {
    if (typeof line === "undefined") {
      return;
    }
    this.searchForVariableInString(line, this.lineNb);

    // Match variable
    let match = line.match(/^\s*(\w+)\s*=/);
    if (match) {
      let name = match[1];
      let start = line.search(name);
      let end = start + name.length;
      let range = PositiveRange(this.lineNb, start, end);
      if (!this.items.has(name)) {
        this.items.add(
          name,
          new VariableCompletion(name, line, range, this.uri)
        );
      }
      return;
    }
  }

  searchForVariableInString(line: string, lineNb: number): void {
    if (line === undefined || /^\s*\*/.test(line)) {
      return;
    }
    let items = this.items
      .getAllItems()
      .filter((e) => e.kind === CompletionItemKind.Variable);
    const re: RegExp = /\b(\w+)\b/g;
    let matchItem: RegExpExecArray;
    do {
      matchItem = re.exec(line);
      if (matchItem) {
        let matchVariable = items.find(
          (e) => e.name === matchItem[1].toUpperCase()
        );
        if (matchVariable) {
          let range = PositiveRange(
            lineNb,
            matchItem.index,
            matchItem.index + matchItem[0].length
          );
          matchVariable.calls.push(new Location(URI.parse(this.uri), range));
        }
      }
    } while (matchItem);
  }
}

function PositiveRange(
  lineNb: number,
  start: number = 0,
  end: number = 0
): Range {
  lineNb = lineNb > 0 ? lineNb : 0;
  start = start > 0 ? start : 0;
  end = end > 0 ? end : 0;
  return new Range(lineNb, start, lineNb, end);
}
