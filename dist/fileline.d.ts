import { ParseRuntime } from "./ParseRuntime";
export declare function stringToLines(data: string, param: ParseRuntime): StringToLinesResult;
export interface StringToLinesResult {
    lines: Fileline[];
    partial: string;
}
export type Fileline = string;
