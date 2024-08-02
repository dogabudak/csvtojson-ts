import { Converter } from "./Converter";
import { Fileline } from "./fileline";
export declare class RowSplit {
    private conv;
    private quote;
    private trim;
    private escape;
    private cachedRegExp;
    private delimiterEmitted;
    private _needEmitDelimiter?;
    private get needEmitDelimiter();
    constructor(conv: Converter);
    parse(fileline: Fileline): RowSplitResult;
    private toCSVRow;
    private getDelimiter;
    private isQuoteOpen;
    private isQuoteClose;
    private escapeQuote;
    parseMultiLines(lines: Fileline[]): MultipleRowResult;
    parseOpenLines(line: string): string;
}
export interface MultipleRowResult {
    rowsCells: string[][];
    partial: string;
}
export interface RowSplitResult {
    cells: string[];
    closed: boolean;
}
