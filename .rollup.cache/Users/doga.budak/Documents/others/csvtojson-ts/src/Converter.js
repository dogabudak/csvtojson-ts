import { access, constants, createReadStream } from "node:fs";
import { Transform, Readable } from "stream";
import { mergeParams } from "./Parameters";
import { initParseRuntime } from "./ParseRuntime";
import { ProcessorLocal } from "./ProcessorLocal";
import { Result } from "./Result";
export class Converter extends Transform {
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
        access(filePath, constants.F_OK, (err) => {
            if (!err) {
                // @ts-ignore
                const rs = createReadStream(filePath, options);
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
        const read = new Readable();
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
        this.params = mergeParams(param);
        this.runtime = initParseRuntime(this);
        this.result = new Result(this);
        this.processor = new ProcessorLocal(this);
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
//# sourceMappingURL=Converter.js.map