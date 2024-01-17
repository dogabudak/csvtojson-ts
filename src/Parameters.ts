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
  needEmitAll: boolean;
}

export type CellParser = (
  item: string,
  head: string,
  resultRow: any,
  row: string[],
  columnIndex: number
) => any;

export interface ColumnParam {
  flat?: boolean;
  cellParser?: string | CellParser;
}

export function mergeParams(params?: Partial<CSVParseParam> | any): CSVParseParam {
  const defaultParam: Record<string, any> = {
    delimiter: ",",
    ignoreColumns: undefined,
    includeColumns: undefined,
    quote: '"',
    trim: true,
    checkType: false,
    ignoreEmpty: false,
    noheader: false,
    headers: undefined,
    flatKeys: false,
    maxRowLength: 0,
    checkColumn: false,
    escape: '"',
    colParser: {},
    eol: undefined,
    alwaysSplitAtEOL: false,
    output: "json",
    nullObject: false,
    downstreamFormat: "line",
    needEmitAll:true
  };
  if (!params) {
    params = {};
  }
  for (const key in params) {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        defaultParam[key] = [].concat(params[key]);
      } else {
        defaultParam[key] = params[key];
      }
    }
  }
  return defaultParam as CSVParseParam;
}
