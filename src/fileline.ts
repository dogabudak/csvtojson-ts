import { ParseRuntime } from "./ParseRuntime";
import getEol from "./getEol";

export function stringToLines(
  data: string,
  param: ParseRuntime
): StringToLinesResult {
  const eol = getEol(data, param);
  const lines = data.split(eol);
  const partial = lines.pop() || "";
  return { lines: lines, partial: partial };
}

export interface StringToLinesResult {
  lines: Fileline[];

  partial: string;
}
export type Fileline = string;
