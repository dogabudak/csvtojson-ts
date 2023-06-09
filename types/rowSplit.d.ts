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
  private readonly needEmitDelimiter;
  constructor(conv: Converter);
  parse(fileline: Fileline): RowSplitResult;
  private toCSVRow(rowArr, trim, quote, delimiter);
  private getDelimiter(fileline);
  private isQuoteOpen(str);
  private isQuoteClose(str);
  private escapeQuote(segment);
  parseMultiLines(lines: Fileline[]): MultipleRowResult;
}
export interface MultipleRowResult {
  rowsCells: string[][];
  partial: string;
}
export interface RowSplitResult {
  /**
   * csv row array. ["a","b","c"]
   */
  cells: string[];
  /**
   * if the passed fileline is a complete row
   */
  closed: boolean;
}
