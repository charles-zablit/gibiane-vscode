import * as spCompletions from "./gbCompletions";
import * as fs from "fs";
import { VariableCompletion } from "./gbCompletionsKind";

export function parse_file(
  file: string,
  completions: spCompletions.FileCompletions
) {
  let data = fs.readFileSync(file, "utf-8");
  parse_text(
    data,
    completions,
  );
}

export function parse_text(
  data: string,
  completions: spCompletions.FileCompletions
) {
  if (typeof data === "undefined") {
    return; // Asked to parse an empty file
  }
  let lines = data.split("\n");
  let parser = new Parser(
    lines,
    completions,
  );
  parser.parse();
}

class Parser {
  completions: spCompletions.FileCompletions;
  lines: string[];
  lineNb: number;

  constructor(
    lines: string[],
    completions: spCompletions.FileCompletions
  ) {
    this.completions = completions;
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
      this.completions.add(
				match[1],
				new VariableCompletion(match[1])
			);
			return;
    }
	}
}