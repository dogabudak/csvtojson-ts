import { Converter } from "./Converter";
import { ProcessLineResult } from "./Processor";
import CSVError from "./CSVError";
import { EOL } from "os";
export class Result {
  private get needEmitLine(): boolean {
    return (
      (!!this.converter.parseRuntime.subscribe &&
        !!this.converter.parseRuntime.subscribe.onNext) ||
      this.needPushDownstream
    );
  }
  private _needPushDownstream?: boolean;
  private get needPushDownstream(): boolean {
    if (this._needPushDownstream === undefined) {
      this._needPushDownstream =
        this.converter.listeners("data").length > 0 ||
        this.converter.listeners("readable").length > 0;
    }
    return this._needPushDownstream;
  }
  private finalResult: any[] = [];
  constructor(private converter: Converter) {}
  processResult(resultLines: ProcessLineResult[]): Promise<any> {
    const startPos = this.converter.parseRuntime.parsedLineNumber;
    if (
      this.needPushDownstream &&
      this.converter.parseParam.downstreamFormat === "array"
    ) {
      if (startPos === 0) {
        pushDownstream(this.converter, "[" + EOL);
      }
    }
    return new Promise<void>((resolve, reject) => {
      if (this.needEmitLine) {
        processLineByLine(
          resultLines,
          this.converter,
          0,
          this.needPushDownstream,
          (err) => {
            if (err) {
              reject(err);
            } else {
              this.appendFinalResult(resultLines);
              resolve();
            }
          }
        );
      } else {
        this.appendFinalResult(resultLines);
        resolve();
      }
    });
  }
  appendFinalResult(lines: any[]) {
    this.finalResult = this.finalResult.concat(lines);
    this.converter.parseRuntime.parsedLineNumber += lines.length;
  }
  processError(err: CSVError) {
    if (
      this.converter.parseRuntime.subscribe &&
      this.converter.parseRuntime.subscribe.onError
    ) {
      this.converter.parseRuntime.subscribe.onError(err);
    }
    if (
      this.converter.parseRuntime.then &&
      this.converter.parseRuntime.then.onrejected
    ) {
      this.converter.parseRuntime.then.onrejected(err);
    }
  }
  endProcess() {
    if (
      this.converter.parseRuntime.then &&
      this.converter.parseRuntime.then.onfulfilled
    ) {
      this.converter.parseRuntime.then.onfulfilled(this.finalResult);
    }
    if (
      this.converter.parseRuntime.subscribe &&
      this.converter.parseRuntime.subscribe.onCompleted
    ) {
      this.converter.parseRuntime.subscribe.onCompleted();
    }
    if (
      this.needPushDownstream &&
      this.converter.parseParam.downstreamFormat === "array"
    ) {
      pushDownstream(this.converter, "]" + EOL);
    }
  }
}

function processLineByLine(
  lines: ProcessLineResult[],

  conv: Converter,
  offset: number,
  needPushDownstream: boolean,
  cb: (err?: any) => void
) {
  if (offset >= lines.length) {
    cb();
  } else {
    if (conv.parseRuntime.subscribe && conv.parseRuntime.subscribe.onNext) {
      const hook = conv.parseRuntime.subscribe.onNext;
      const nextLine = lines[offset];
      const res = hook(nextLine, conv.parseRuntime.parsedLineNumber + offset);
      offset++;
      if (res && res.then) {
        res.then(function () {
          processRecursive(
            lines,
            conv,
            offset,
            needPushDownstream,
            cb,
            nextLine
          );
        }, cb);
      } else {
        if (needPushDownstream) {
          pushDownstream(conv, nextLine);
        }
        while (offset < lines.length) {
          const line = lines[offset];
          hook(line, conv.parseRuntime.parsedLineNumber + offset);
          offset++;
          if (needPushDownstream) {
            pushDownstream(conv, line);
          }
        }
        cb();
      }
    } else {
      if (needPushDownstream) {
        while (offset < lines.length) {
          const line = lines[offset++];
          pushDownstream(conv, line);
        }
      }
      cb();
    }
  }
}

export function processRecursive(
  lines: ProcessLineResult[],
  conv: Converter,
  offset: number,
  needPushDownstream: boolean,
  cb: (err?: any) => void,
  res: ProcessLineResult
) {
  if (needPushDownstream) {
    pushDownstream(conv, res);
  }
  processLineByLine(lines, conv, offset, needPushDownstream, cb);
}
function pushDownstream(conv: Converter, res: ProcessLineResult) {
  if (typeof res === "object" && !conv.options.objectMode) {
    const data = JSON.stringify(res);
    conv.push(
      data + (conv.parseParam.downstreamFormat === "array" ? "," + EOL : EOL),
      "utf8"
    );
  } else {
    conv.push(res);
  }
}
