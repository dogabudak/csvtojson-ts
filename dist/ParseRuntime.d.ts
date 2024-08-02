/// <reference types="node" />
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
export declare function initParseRuntime(converter: Converter): ParseRuntime;
