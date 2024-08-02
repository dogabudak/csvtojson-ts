export interface CSVParseParam {
    delimiter: string | string[];
    ignoreColumns?: RegExp;
    includeColumns?: RegExp;
    quote: string;
    trim: boolean;
    checkType: boolean;
    ignoreEmpty: boolean;
    noheader: boolean;
    headers?: string[];
    flatKeys: boolean;
    maxRowLength: number;
    checkColumn: boolean;
    escape: string;
    colParser: {
        [key: string]: string | CellParser | ColumnParam;
    };
    eol?: string;
    alwaysSplitAtEOL: boolean;
    output: "json" | "csv" | "line";
    nullObject: boolean;
    downstreamFormat: "line" | "array";
}
export type CellParser = (item: string, head: string, resultRow: any, row: string[], columnIndex: number) => any;
export interface ColumnParam {
    flat?: boolean;
    cellParser?: string | CellParser;
}
export declare function mergeParams(params?: Partial<CSVParseParam> | any): CSVParseParam;
