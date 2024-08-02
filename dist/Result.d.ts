import { Converter } from "./Converter";
import { ProcessLineResult } from "./Processor";
import CSVError from "./CSVError";
export declare class Result {
    private converter;
    private get needEmitLine();
    private _needPushDownstream?;
    private get needPushDownstream();
    private finalResult;
    constructor(converter: Converter);
    processResult(resultLines: ProcessLineResult[]): Promise<any>;
    appendFinalResult(lines: any[]): void;
    processError(err: CSVError): void;
    endProcess(): void;
}
export declare function processRecursive(lines: ProcessLineResult[], hook: (data: any, lineNumber: number) => void | PromiseLike<void>, conv: Converter, offset: number, needPushDownstream: boolean, cb: (err?: any) => void, res: ProcessLineResult): void;
