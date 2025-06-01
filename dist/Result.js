"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
exports.processRecursive = processRecursive;
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
                    processRecursive(lines, conv, offset, needPushDownstream, cb, nextLine);
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
function processRecursive(lines, conv, offset, needPushDownstream, cb, res) {
    if (needPushDownstream) {
        pushDownstream(conv, res);
    }
    processLineByLine(lines, conv, offset, needPushDownstream, cb);
}
function pushDownstream(conv, res) {
    if (typeof res === "object" && !conv.options.objectMode) {
        const data = JSON.stringify(res);
        conv.push(data + (conv.parseParam.downstreamFormat === "array" ? "," + os_1.EOL : os_1.EOL), "utf8");
    }
    else {
        conv.push(res);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1Jlc3VsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFvSkEsNENBWUM7QUE3SkQsMkJBQXlCO0FBQ3pCLE1BQWEsTUFBTTtJQWtCRztJQWpCcEIsSUFBWSxZQUFZO1FBQ3RCLE9BQU8sQ0FDTCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTO1lBQ3RDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQ2pELElBQUksQ0FBQyxrQkFBa0IsQ0FDeEIsQ0FBQztJQUNKLENBQUM7SUFDTyxtQkFBbUIsQ0FBVztJQUN0QyxJQUFZLGtCQUFrQjtRQUM1QixJQUFJLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsbUJBQW1CO2dCQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztvQkFDM0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7SUFDbEMsQ0FBQztJQUNPLFdBQVcsR0FBVSxFQUFFLENBQUM7SUFDaEMsWUFBb0IsU0FBb0I7UUFBcEIsY0FBUyxHQUFULFNBQVMsQ0FBVztJQUFHLENBQUM7SUFDNUMsYUFBYSxDQUFDLFdBQWdDO1FBQzVDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDO1FBQzlELElBQ0UsSUFBSSxDQUFDLGtCQUFrQjtZQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsS0FBSyxPQUFPLEVBQ3RELENBQUM7WUFDRCxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDbkIsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxHQUFHLFFBQUcsQ0FBQyxDQUFDO1lBQzVDLENBQUM7UUFDSCxDQUFDO1FBQ0QsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUMzQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDdEIsaUJBQWlCLENBQ2YsV0FBVyxFQUNYLElBQUksQ0FBQyxTQUFTLEVBQ2QsQ0FBQyxFQUNELElBQUksQ0FBQyxrQkFBa0IsRUFDdkIsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDTixJQUFJLEdBQUcsRUFBRSxDQUFDO3dCQUNSLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDZCxDQUFDO3lCQUFNLENBQUM7d0JBQ04sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUNwQyxPQUFPLEVBQUUsQ0FBQztvQkFDWixDQUFDO2dCQUNILENBQUMsQ0FDRixDQUFDO1lBQ0osQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDcEMsT0FBTyxFQUFFLENBQUM7WUFDWixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsaUJBQWlCLENBQUMsS0FBWTtRQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLGdCQUFnQixJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDL0QsQ0FBQztJQUNELFlBQVksQ0FBQyxHQUFhO1FBQ3hCLElBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUztZQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUM3QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBQ0QsSUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJO1lBQ2hDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQzNDLENBQUM7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELENBQUM7SUFDSCxDQUFDO0lBQ0QsVUFBVTtRQUNSLElBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSTtZQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUM1QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUNELElBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUztZQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUNqRCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFDRCxJQUNFLElBQUksQ0FBQyxrQkFBa0I7WUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEtBQUssT0FBTyxFQUN0RCxDQUFDO1lBQ0QsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxHQUFHLFFBQUcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUF6RkQsd0JBeUZDO0FBRUQsU0FBUyxpQkFBaUIsQ0FDeEIsS0FBMEIsRUFFMUIsSUFBZSxFQUNmLE1BQWMsRUFDZCxrQkFBMkIsRUFDM0IsRUFBdUI7SUFFdkIsSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzNCLEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQztTQUFNLENBQUM7UUFDTixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3RFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUNoRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sRUFBRSxDQUFDO1lBQ1QsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwQixHQUFHLENBQUMsSUFBSSxDQUFDO29CQUNQLGdCQUFnQixDQUNkLEtBQUssRUFDTCxJQUFJLEVBQ0osTUFBTSxFQUNOLGtCQUFrQixFQUNsQixFQUFFLEVBQ0YsUUFBUSxDQUNULENBQUM7Z0JBQ0osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ1QsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksa0JBQWtCLEVBQUUsQ0FBQztvQkFDdkIsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDakMsQ0FBQztnQkFDRCxPQUFPLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQzdCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDM0IsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxDQUFDO29CQUN4RCxNQUFNLEVBQUUsQ0FBQztvQkFDVCxJQUFJLGtCQUFrQixFQUFFLENBQUM7d0JBQ3ZCLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzdCLENBQUM7Z0JBQ0gsQ0FBQztnQkFDRCxFQUFFLEVBQUUsQ0FBQztZQUNQLENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksa0JBQWtCLEVBQUUsQ0FBQztnQkFDdkIsT0FBTyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUM3QixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztvQkFDN0IsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDN0IsQ0FBQztZQUNILENBQUM7WUFDRCxFQUFFLEVBQUUsQ0FBQztRQUNQLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQWdCLGdCQUFnQixDQUM5QixLQUEwQixFQUMxQixJQUFlLEVBQ2YsTUFBYyxFQUNkLGtCQUEyQixFQUMzQixFQUF1QixFQUN2QixHQUFzQjtJQUV0QixJQUFJLGtCQUFrQixFQUFFLENBQUM7UUFDdkIsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ0QsaUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUNELFNBQVMsY0FBYyxDQUFDLElBQWUsRUFBRSxHQUFzQjtJQUM3RCxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUNQLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsUUFBRyxDQUFDLENBQUMsQ0FBQyxRQUFHLENBQUMsRUFDdkUsTUFBTSxDQUNQLENBQUM7SUFDSixDQUFDO1NBQU0sQ0FBQztRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQztBQUNILENBQUMifQ==