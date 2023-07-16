import { Processor, ProcessLineResult } from "./Processor";
import { Converter } from "./Converter";
import { ChildProcess } from "child_process";
import { CSVParseParam, mergeParams } from "./Parameters";
import CSVError from "./CSVError";

export class ProcessorFork extends Processor {
  flush(): Promise<ProcessLineResult[]> {
    return new Promise((resolve) => {
      this.finalChunk = true;
      this.next = resolve;
      this.childProcess.stdin?.end();
    });
  }
  destroy(): Promise<void> {
    this.childProcess.kill();
    return Promise.resolve();
  }
  childProcess: ChildProcess;
  inited = false;
  private resultBuf: ProcessLineResult[] = [];
  private leftChunk = "";
  private finalChunk = false;
  private next?: (result: ProcessLineResult[]) => any;
  constructor(protected converter: Converter) {
    super(converter);
    this.childProcess = require("child_process").spawn(
      process.execPath,
      [__dirname + "/../v2/worker.js"],
      {
        stdio: ["pipe", "pipe", "pipe", "ipc"]
      }
    );
    this.initWorker();
  }
  private prepareParam(param: CSVParseParam): any {
    const clone: any = mergeParams(param);
    if (clone.ignoreColumns) {
      clone.ignoreColumns = {
        source: clone.ignoreColumns.source,
        flags: clone.ignoreColumns.flags
      };
    }
    if (clone.includeColumns) {
      clone.includeColumns = {
        source: clone.includeColumns.source,
        flags: clone.includeColumns.flags
      };
    }
    return clone;
  }
  private initWorker() {
    this.childProcess.on("exit", () => {
      this.flushResult();
    });
    this.childProcess.send({
      cmd: "init",
      params: this.prepareParam(this.converter.parseParam)
    } as InitMessage);
    this.childProcess.on("message", (msg: Message) => {
      if (msg.cmd === "inited") {
        this.inited = true;
      } else if (msg.cmd === "eol") {
        if (this.converter.listeners("eol").length > 0) {
          this.converter.emit("eol", (msg as StringMessage).value);
        }
      } else if (msg.cmd === "header") {
        if (this.converter.listeners("header").length > 0) {
          this.converter.emit("header", (msg as StringMessage).value);
        }
      } else if (msg.cmd === "done") {
        return;
      }
    });
    this.childProcess.stdout?.on("data", (data) => {
      // console.log("stdout", data.toString());
      const res = data.toString();
      // console.log(res);
      this.appendBuf(res);
    });
    this.childProcess.stderr?.on("data", (data) => {
      // console.log("stderr", data.toString());
      this.converter.emit("error", CSVError.fromJSON(JSON.parse(data.toString())));
    });
  }
  private flushResult() {
    // console.log("flush result", this.resultBuf.length);
    if (this.next) {
      this.next(this.resultBuf);
    }
    this.resultBuf = [];
  }
  private appendBuf(data: string) {
    const res = this.leftChunk + data;
    const list = res.split("\n");
    const lastBit = list[list.length - 1];
    if (lastBit !== "") {
      this.leftChunk = list.pop() || "";
    } else {
      this.leftChunk = "";
    }
    this.resultBuf = this.resultBuf.concat(list);
  }

  process(chunk: Buffer): Promise<ProcessLineResult[]> {
    return new Promise((resolve) => {
      this.next = resolve;
      this.childProcess.stdin?.write(chunk, () => {
        this.flushResult();
      });
    });
  }
}

export interface Message {
  cmd: string;
}

export interface InitMessage extends Message {
  params: any;
}
export interface StringMessage extends Message {
  value: string;
}
export const EOM = "\x03";
