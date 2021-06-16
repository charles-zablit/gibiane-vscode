import * as gbCompletions from "./gbCompletions";
import * as gbDefinitions from "./gbDefinitions";
import * as fs from "fs";
import { URI } from "vscode-uri";
import * as vscode from "vscode";
import { VariableCompletion } from "./gbCompletionsKind";

export function parse_file(
  file: string,
  completions: gbCompletions.FileCompletions,
  definitions: gbDefinitions.Definitions
) {
  let data = fs.readFileSync(file, "utf-8");
  parse_text(data, completions, definitions, file);
}

export function parse_text(
  data: string,
  completions: gbCompletions.FileCompletions,
  definitions: gbDefinitions.Definitions,
  file: string
) {
  if (typeof data === "undefined") {
    return; // Asked to parse an empty file
  }
  let lines = data.split("\n");
  let parser = new Parser(lines, completions, definitions, file);
  parser.parse();
}

class Parser {
  completions: gbCompletions.FileCompletions;
  definitions: gbDefinitions.Definitions;
  lines: string[];
  lineNb: number;
  file: string;

  constructor(
    lines: string[],
    completions: gbCompletions.FileCompletions,
    definitions: gbDefinitions.Definitions,
    file: string
  ) {
    this.completions = completions;
    this.definitions = definitions;
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
      this.completions.add(match[1], new VariableCompletion(match[1]));
      this.AddDefinition(match[1], line, gbDefinitions.DefinitionKind.Variable);
      return;
    }
  }

  AddDefinition(
    name: string,
    line: string,
    kind: gbDefinitions.DefinitionKind,
    search: boolean = true
  ): void {
    let start: number = search ? line.search(name) : 0;
    let end: number = search ? start + name.length : 0;
    var def: gbDefinitions.DefLocation = new gbDefinitions.DefLocation(
      URI.parse(this.file),
      PositiveRange(this.lineNb, start, end),
      kind
    );
    if (!this.definitions.has(name)) {
      this.definitions.set(name, def);
    }
    return;
  }
}

function PositiveRange(
  lineNb: number,
  start: number = 0,
  end: number = 0
): vscode.Range {
  lineNb = lineNb > 0 ? lineNb : 0;
  start = start > 0 ? start : 0;
  end = end > 0 ? end : 0;
  return new vscode.Range(lineNb, start, lineNb, end);
}
