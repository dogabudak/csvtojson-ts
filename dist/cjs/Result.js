'use strict';const os=require('os');class Result {
    converter;
    get needEmitLine() {
        return ((!!this.converter.parseRuntime.subscribe &&
            !!this.converter.parseRuntime.subscribe.onNext) ||
            this.needPushDownstream);
    }
    _needPushDownstream;
    get needPushDownstream() {
        if (this._needPushDownstream === undefined) {
            this._needPushDownstream =
                this.converter.listeners("data").length > 0 ||
                    this.converter.listeners("readable").length > 0;
        }
        return this._needPushDownstream;
    }
    get needEmitAll() {
        return (!!this.converter.parseRuntime.then && this.converter.parseParam.needEmitAll);
    }
    finalResult = [];
    constructor(converter) {
        this.converter = converter;
    }
    processResult(resultLines) {
        const startPos = this.converter.parseRuntime.parsedLineNumber;
        if (this.needPushDownstream &&
            this.converter.parseParam.downstreamFormat === "array") {
            if (startPos === 0) {
                pushDownstream(this.converter, "[" + os.EOL);
            }
        }
        return new Promise((resolve, reject) => {
            if (this.needEmitLine) {
                processLineByLine(resultLines, this.converter, 0, this.needPushDownstream, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        this.appendFinalResult(resultLines);
                        resolve();
                    }
                });
            }
            else {
                this.appendFinalResult(resultLines);
                resolve();
            }
        });
    }
    appendFinalResult(lines) {
        if (this.needEmitAll) {
            this.finalResult = this.finalResult.concat(lines);
        }
        this.converter.parseRuntime.parsedLineNumber += lines.length;
    }
    processError(err) {
        if (this.converter.parseRuntime.subscribe &&
            this.converter.parseRuntime.subscribe.onError) {
            this.converter.parseRuntime.subscribe.onError(err);
        }
        if (this.converter.parseRuntime.then &&
            this.converter.parseRuntime.then.onrejected) {
            this.converter.parseRuntime.then.onrejected(err);
        }
    }
    endProcess() {
        if (this.converter.parseRuntime.then &&
            this.converter.parseRuntime.then.onfulfilled) {
            if (this.needEmitAll) {
                this.converter.parseRuntime.then.onfulfilled(this.finalResult);
            }
            else {
                this.converter.parseRuntime.then.onfulfilled([]);
            }
        }
        if (this.converter.parseRuntime.subscribe &&
            this.converter.parseRuntime.subscribe.onCompleted) {
            this.converter.parseRuntime.subscribe.onCompleted();
        }
        if (this.needPushDownstream &&
            this.converter.parseParam.downstreamFormat === "array") {
            pushDownstream(this.converter, "]" + os.EOL);
        }
    }
}
function processLineByLine(lines, conv, offset, needPushDownstream, cb) {
    if (offset >= lines.length) {
        cb();
    }
    else {
        if (conv.parseRuntime.subscribe && conv.parseRuntime.subscribe.onNext) {
            const hook = conv.parseRuntime.subscribe.onNext;
            const nextLine = lines[offset];
            const res = hook(nextLine, conv.parseRuntime.parsedLineNumber + offset);
            offset++;
            if (res && res.then) {
                res.then(function () {
                    processRecursive(lines, hook, conv, offset, needPushDownstream, cb, nextLine);
                }, cb);
            }
            else {
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
        }
        else {
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
function processRecursive(lines, hook, conv, offset, needPushDownstream, cb, res) {
    if (needPushDownstream) {
        pushDownstream(conv, res);
    }
    processLineByLine(lines, conv, offset, needPushDownstream, cb);
}
function pushDownstream(conv, res) {
    if (typeof res === "object" && !conv.options.objectMode) {
        const data = JSON.stringify(res);
        conv.push(data + (conv.parseParam.downstreamFormat === "array" ? "," + os.EOL : os.EOL), "utf8");
    }
    else {
        conv.push(res);
    }
}exports.Result=Result;//# sourceMappingURL=Result.js.map
