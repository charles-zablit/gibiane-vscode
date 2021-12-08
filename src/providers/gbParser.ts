import { Range } from "vscode";
import { FileItems } from "./gbItemsRepository";
import { readFileSync } from "fs";
import { VariableCompletion } from "./gbItems";

export function parseFile(file: string, completions: FileItems) {
  let data = readFileSync(file, "utf-8");
  parseText(data, completions, file);
}

export function parseText(data: string, completions: FileItems, file: string) {
  if (typeof data === "undefined") {
    return; // Asked to parse an empty file
  }
  let lines = data.split("\n");
  let parser = new Parser(lines, completions, file);
  parser.parse();
}

class Parser {
  items: FileItems;
  lines: string[];
  lineNb: number;
  file: string;

  constructor(lines: string[], items: FileItems, file: string) {
    this.items = items;
    this.file = file;
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
    if (typeof line === "undefined") return;
    // Match define
    let match = line.match(/^\s*(\w+)\s*=/);
    if (match) {
      let name = match[1];
      let start = line.search(name);
      let end = start + name.length;
      let range = PositiveRange(this.lineNb, start, end);
      // this.AddDefinition(name, line, gbDefinitions.DefinitionKind.Variable);
      this.items.add(
        name,
        new VariableCompletion(name, line, range, this.file)
      );
      return;
    }
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
