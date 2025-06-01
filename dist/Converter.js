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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udmVydGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NvbnZlcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBOEQ7QUFDOUQsbUNBQWdGO0FBQ2hGLDZDQUEwRDtBQUMxRCxpREFBZ0U7QUFFaEUscURBQWtEO0FBQ2xELHFDQUFrQztBQUdsQyxNQUFhLFNBQVUsU0FBUSxrQkFBUztJQTZGN0I7SUE1RlQsVUFBVSxDQUFDLFNBQTZCO1FBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztRQUN4QyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxXQUFXLENBQUMsVUFBK0I7UUFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDO1FBQzFDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELFNBQVMsQ0FDUCxNQUFvRSxFQUNwRSxPQUFpQyxFQUNqQyxXQUF3QjtRQUV4QixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRztZQUM1QixNQUFNO1lBQ04sT0FBTztZQUNQLFdBQVc7U0FDWixDQUFDO1FBQ0YsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsUUFBUSxDQUNOLFFBQWdCLEVBQ2hCLE9BQXNEO1FBRXRELElBQUEsZ0JBQU0sRUFBQyxRQUFRLEVBQUUsbUJBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUN2QyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ1QsTUFBTSxFQUFFLEdBQUcsSUFBQSwwQkFBZ0IsRUFBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQy9DLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksQ0FBQyxJQUFJLENBQ1AsT0FBTyxFQUNQLElBQUksS0FBSyxDQUNQLDBCQUEwQixRQUFRLDRE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