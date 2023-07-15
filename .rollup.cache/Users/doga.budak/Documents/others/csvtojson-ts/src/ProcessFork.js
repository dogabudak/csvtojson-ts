import { Processor } from "./Processor";
import { mergeParams } from "./Parameters";
import CSVError from "./CSVError";
export class ProcessorFork extends Processor {
    converter;
    flush() {
        return new Promise((resolve) => {
            this.finalChunk = true;
            this.next = resolve;
            this.childProcess.stdin?.end();
        });
    }
    destroy() {
        this.childProcess.kill();
        return Promise.resolve();
    }
    childProcess;
    inited = false;
    resultBuf = [];
    leftChunk = "";
    finalChunk = false;
    next;
    constructor(converter) {
        super(converter);
        this.converter = converter;
        this.childProcess = require("child_process").spawn(process.execPath, [__dirname + "/../v2/worker.js"], {
            stdio: ["pipe", "pipe", "pipe", "ipc"]
        });
        this.initWorker();
    }
    prepareParam(param) {
        const clone = mergeParams(param);
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
    initWorker() {
        this.childProcess.on("exit", () => {
            this.flushResult();
        });
        this.childProcess.send({
            cmd: "init",
            params: this.prepareParam(this.converter.parseParam)
        });
        this.childProcess.on("message", (msg) => {
            if (msg.cmd === "inited") {
                this.inited = true;
            }
            else if (msg.cmd === "eol") {
                if (this.converter.listeners("eol").length > 0) {
                    this.converter.emit("eol", msg.value);
                }
            }
            else if (msg.cmd === "header") {
                if (this.converter.listeners("header").length > 0) {
                    this.converter.emit("header", msg.value);
                }
            }
            else if (msg.cmd === "done") {
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
    flushResult() {
        // console.log("flush result", this.resultBuf.length);
        if (this.next) {
            this.next(this.resultBuf);
        }
        this.resultBuf = [];
    }
    appendBuf(data) {
        const res = this.leftChunk + data;
        const list = res.split("\n");
        const lastBit = list[list.length - 1];
        if (lastBit !== "") {
            this.leftChunk = list.pop() || "";
        }
        else {
            this.leftChunk = "";
        }
        this.resultBuf = this.resultBuf.concat(list);
    }
    process(chunk) {
        return new Promise((resolve) => {
            this.next = resolve;
            this.childProcess.stdin?.write(chunk, () => {
                this.flushResult();
            });
        });
    }
}
export const EOM = "\x03";
//# sourceMappingURL=ProcessFork.js.map