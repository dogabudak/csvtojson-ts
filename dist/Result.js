"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRecursive = exports.Result = void 0;
const os_1 = require("os");
class Result {
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
    finalResult = [];
    constructor(converter) {
        this.converter = converter;
    }
    processResult(resultLines) {
        const startPos = this.converter.parseRuntime.parsedLineNumber;
        if (this.needPushDownstream &&
            this.converter.parseParam.downstreamFormat === "array") {
            if (startPos === 0) {
                pushDownstream(this.converter, "[" + os_1.EOL);
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
        this.finalResult = this.finalResult.concat(lines);
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
            this.converter.parseRuntime.then.onfulfilled(this.finalResult);
        }
        if (this.converter.parseRuntime.subscribe &&
            this.converter.parseRuntime.subscribe.onCompleted) {
            this.converter.parseRuntime.subscribe.onCompleted();
        }
        if (this.needPushDownstream &&
            this.converter.parseParam.downstreamFormat === "array") {
            pushDownstream(this.converter, "]" + os_1.EOL);
        }
    }
}
exports.Result = Result;
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
exports.processRecursive = processRecursive;
function pushDownstream(conv, res) {
    if (typeof res === "object" && !conv.options.objectMode) {
        const data = JSON.stringify(res);
        conv.push(data + (conv.parseParam.downstreamFormat === "array" ? "," + os_1.EOL : os_1.EOL), "utf8");
    }
    else {
        conv.push(res);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1Jlc3VsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSwyQkFBeUI7QUFDekIsTUFBYSxNQUFNO0lBa0JHO0lBakJwQixJQUFZLFlBQVk7UUFDdEIsT0FBTyxDQUNMLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVM7WUFDdEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFDakQsSUFBSSxDQUFDLGtCQUFrQixDQUN4QixDQUFDO0lBQ0osQ0FBQztJQUNPLG1CQUFtQixDQUFXO0lBQ3RDLElBQVksa0JBQWtCO1FBQzVCLElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLFNBQVMsRUFBRTtZQUMxQyxJQUFJLENBQUMsbUJBQW1CO2dCQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztvQkFDM0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztTQUNuRDtRQUNELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ2xDLENBQUM7SUFDTyxXQUFXLEdBQVUsRUFBRSxDQUFDO0lBQ2hDLFlBQW9CLFNBQW9CO1FBQXBCLGNBQVMsR0FBVCxTQUFTLENBQVc7SUFBRyxDQUFDO0lBQzVDLGFBQWEsQ0FBQyxXQUFnQztRQUM1QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5RCxJQUNFLElBQUksQ0FBQyxrQkFBa0I7WUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEtBQUssT0FBTyxFQUN0RDtZQUNBLElBQUksUUFBUSxLQUFLLENBQUMsRUFB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