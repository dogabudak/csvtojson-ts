import { Transform, TransformOptions, Readable } from "stream";

declare class CSVError extends Error {}

declare interface CreateReadStreamOption {
    flags?: string;
    encoding?: string;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    start?: number;
    end?: number;
    highWaterMark?: number;
}

declare type PreFileLineCallback = (
    line: string,
    lineNumber: number
) => string | PromiseLike<string>;

declare type PreRawDataCallback = (csvString: string) => string | PromiseLike<string>;

declare interface CSVParseParam {}

declare function mergeParams(param?: Partial<CSVParseParam>): CSVParseParam;

declare interface ParseRuntime {
    subscribe?: {
        onNext?: (data: any, lineNumber: number) => void | PromiseLike<void>,
        onError?: (err: CSVError) => void,
        onCompleted?: () => void
    };
    then?: {
        onfulfilled?: (value: any[]) => any | PromiseLike<any>,
        onrejected?: (err: Error) => any | PromiseLike<any>
    };
}

declare function initParseRuntime(converter: Converter): ParseRuntime;

declare interface Processor {}

declare class ProcessorLocal implements Processor {
    constructor(converter: Converter);
    destroy(): void;
}

declare class Result {
    constructor(converter: Converter);
    processError(err: any): void;
    processResult(result: any[]): void;
    endProcess(): void;
}

declare class Converter extends Transform implements PromiseLike<any[]> {
    public options: TransformOptions;
    public parseParam: CSVParseParam;
    public parseRuntime: ParseRuntime;

    constructor(param?: Partial<CSVParseParam>, options?: TransformOptions);
    preRawData(onRawData: PreRawDataCallback): Converter;
    preFileLine(onFileLine: PreFileLineCallback): Converter;
    subscribe(
        onNext?: (data: any, lineNumber: number) => void | PromiseLike<void>,
        onError?: (err: CSVError) => void,
        onCompleted?: () => void
    ): Converter;
    fromFile(
        filePath: string,
        options?: string | CreateReadStreamOption | undefined
    ): Converter;
    fromStream(readStream: Readable): Converter;
    fromString(csvString: string): Converter;
    then<TResult1 = any[], TResult2 = never>(
        onfulfilled?: (value: any[]) => TResult1 | PromiseLike<TResult1>,
        onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
    ): PromiseLike<TResult1 | TResult2>;
}

export = Converter;
