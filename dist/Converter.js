"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Converter = void 0;
const node_fs_1 = require("node:fs");
const stream_1 = require("stream");
const Parameters_1 = require("./Parameters");
const ParseRuntime_1 = require("./ParseRuntime");
const ProcessorLocal_1 = require("./ProcessorLocal");
const Result_1 = require("./Result");
class Converter extends stream_1.Transform {
    options;
    preRawData(onRawData) {
        this.runtime.preRawDataHook = onRawData;
        return this;
    }
    preFileLine(onFileLine) {
        this.runtime.preFileLineHook = onFileLine;
        return this;
    }
    subscribe(onNext, onError, onCompleted) {
        this.parseRuntime.subscribe = {
            onNext,
            onError,
            onCompleted
        };
        return this;
    }
    fromFile(filePath, options) {
        (0, node_fs_1.access)(filePath, node_fs_1.constants.F_OK, (err) => {
            if (!err) {
                const rs = (0, node_fs_1.createReadStream)(filePath, options);
                rs.pipe(this);
            }
            else {
                this.emit("error", new Error(`File does not exist at ${filePath}. Check to make sure the file path to your csv is correct.`));
            }
        });
        return this;
    }
    fromStream(readStream) {
        readStream.pipe(this);
        return this;
    }
    fromString(csvString) {
        const read = new stream_1.Readable();
        let idx = 0;
        read._read = function (size) {
            if (idx >= csvString.length) {
                this.push(null);
            }
            else {
                const str = csvString.substring(idx, idx + size);
                this.push(str);
                idx += size;
            }
        };
        return this.fromStream(read);
    }
    then(onfulfilled, onrejected) {
        return new Promise((resolve, reject) => {
            this.parseRuntime.then = {
                onfulfilled: (value) => {
                    if (onfulfilled) {
                        resolve(onfulfilled(value));
                    }
                    else {
                        resolve(value);
                    }
                },
                onrejected: (err) => {
                    if (onrejected) {
                        resolve(onrejected(err));
                    }
                    else {
                        reject(err);
                    }
                }
            };
        });
    }
    get parseParam() {
        return this.params;
    }
    get parseRuntime() {
        return this.runtime;
    }
    params;
    runtime;
    processor;
    result;
    constructor(param, options = {}) {
        super(options);
        this.options = options;
        this.params = (0, Parameters_1.mergeParams)(param);
        this.runtime = (0, ParseRuntime_1.initParseRuntime)(this);
        this.result = new Result_1.Result(this);
        this.processor = new ProcessorLocal_1.ProcessorLocal(this);
        this.once("error", (err) => {
            setImmediate(() => {
                this.result.processError(err);
                this.emit("done", err);
            });
        });
        this.once("done", () => {
            this.processor.destroy();
        });
        return this;
    }
    _transform(chunk, encoding, cb) {
        this.processor
            .process(chunk)
            .then((result) => {
            if (result.length > 0) {
                this.runtime.started = true;
                return this.result.processResult(result);
            }
        })
            .then(() => {
            this.emit("drained");
            cb();
        }, (error) => {
            this.runtime.hasError = true;
            this.runtime.error = error;
            this.emit("error", error);
            cb();
        });
    }
    _flush(cb) {
        this.processor
            .flush()
            .then((data) => {
            if (data.length > 0) {
                return this.result.processResult(data);
            }
        })
            .then(() => {
            this.processEnd(cb);
        }, (err) => {
            this.emit("error", err);
            cb();
        });
    }
    processEnd(cb) {
        this.result.endProcess();
        this.emit("done");
        cb();
    }
}
exports.Converter = Converter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udmVydGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NvbnZlcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBOEQ7QUFDOUQsbUNBQWdGO0FBQ2hGLDZDQUEwRDtBQUMxRCxpREFBZ0U7QUFFaEUscURBQWtEO0FBQ2xELHFDQUFrQztBQUdsQyxNQUFhLFNBQVUsU0FBUSxrQkFBUztJQTZGN0I7SUE1RlQsVUFBVSxDQUFDLFNBQTZCO1FBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztRQUN4QyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxXQUFXLENBQUMsVUFBK0I7UUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDO1FBQzFDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELFNBQVMsQ0FDUCxNQUFvRSxFQUNwRSxPQUFpQyxFQUNqQyxXQUF3QjtRQUV4QixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRztZQUM1QixNQUFNO1lBQ04sT0FBTztZQUNQLFdBQVc7U0FDWixDQUFDO1FBQ0YsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsUUFBUSxDQUNOLFFBQWdCLEVBQ2hCLE9BQXNEO1FBRXRELElBQUEsZ0JBQU0sRUFBQyxRQUFRLEVBQUUsbUJBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUN2QyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNSLE1BQU0sRUFBRSxHQUFHLElBQUEsMEJBQWdCLEVBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMvQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2Y7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FDUCxPQUFPLEVBQ1AsSUFBSSxLQUFLLENBQ1AsMEJBQTBCLFFBQVEsNERBQTRELENBQy9GLENBQ0Ys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