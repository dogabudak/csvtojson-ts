import { CellParser } from "./Parameters";
import { Converter, PreRawDataCallback, PreFileLineCallback } from "./Converter";
import CSVError from "./CSVError";

export interface ParseRuntime {
  needProcessIgnoreColumn: boolean;
  needProcessIncludeColumn: boolean;
  selectedColumns?: number[];
  ended: boolean;
  hasError: boolean;
  error?: Error;
  delimiter: string | string[];
  eol?: string;
  columnConv: (CellParser | null)[];
  headerType: any[];
  headerTitle: string[];
  headerFlag: any[];
  headers?: any[];
  csvLineBuffer?: Buffer;
  started: boolean;
  preRawDataHook?: PreRawDataCallback;
  preFileLineHook?: PreFileLineCallback;
  parsedLineNumber: number;
  columnValueSetter: any[];
  subscribe?: {
    onNext?: (data: any, lineNumber: number) => void | PromiseLike<void>;
    onError?: (err: CSVError) => void;
    onCompleted?: () => void;
  };
  then?: {
    onfulfilled: (value: any[]) => any;
    onrejected: (err: Error) => any;
  };
}
export function initParseRuntime(converter: Converter): ParseRuntime {
  const params = converter.parseParam;
  const rtn: ParseRuntime = {
    needProcessIgnoreColumn: false,
    needProcessIncludeColumn: false,
    selectedColumns: undefined,
    ended: false,
    hasError: false,
    error: undefined,
    delimiter: converter.parseParam.delimiter,
    eol: converter.parseParam.eol,
    columnConv: [],
    headerType: [],
    headerTitle: [],
    headerFlag: [],
    headers: undefined,
    started: false,
    parsedLineNumber: 0,
    columnValueSetter: []
  };
  if (params.ignoreColumns) {
    rtn.needProcessIgnoreColumn = true;
  }
  if (params.includeColumns) {
    rtn.needProcessIncludeColumn = true;
  }
  return rtn;
}
