"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessorLocal = void 0;
const Processor_1 = require("./Processor");
const dataClean_1 = require("./dataClean");
const getEol_1 = __importDefault(require("./getEol"));
const fileline_1 = require("./fileline");
const util_1 = require("./util");
const rowSplit_1 = require("./rowSplit");
const lineToJson_1 = __importDefault(require("./lineToJson"));
const CSVError_1 = __importDefault(require("./CSVError"));
class ProcessorLocal extends Processor_1.Processor {
    async flush() {
        if (this.runtime.csvLineBuffer && this.runtime.csvLineBuffer.length > 0) {
            const buf = this.runtime.csvLineBuffer;
            this.runtime.csvLineBuffer = undefined;
            const res = await this.process(buf, true);
            if (this.runtime.csvLineBuffer && this.runtime.csvLineBuffer.length > 0) {
                throw CSVError_1.default.unclosed_quote(this.runtime.parsedLineNumber, this.runtime.csvLineBuffer.toString());
            }
            else {
                return res;
            }
        }
        else {
            return [];
        }
    }
    destroy() {
        return Promise.resolve();
    }
    rowSplit = new rowSplit_1.RowSplit(this.converter);
    eolEmitted = false;
    _needEmitEol = undefined;
    get needEmitEol() {
        if (this._needEmitEol === undefined) {
            this._needEmitEol = this.converter.listeners("eol").length > 0;
        }
        return this._needEmitEol;
    }
    headEmitted = false;
    _needEmitHead = undefined;
    get needEmitHead() {
        if (this._needEmitHead === undefined) {
            this._needEmitHead = this.converter.listeners("header").length > 0;
        }
        return this._needEmitHead;
    }
    process(chunk, finalChunk = false) {
        let csvString;
        if (finalChunk) {
            csvString = chunk.toString();
        }
        else {
            csvString = (0, dataClean_1.prepareData)(chunk, this.converter.parseRuntime);
        }
        return Promise.resolve()
            .then(() => {
            if (this.runtime.preRawDataHook) {
                return this.runtime.preRawDataHook(csvString);
            }
            else {
                return csvString;
            }
        })
            .then((csv) => {
            if (csv && csv.length > 0) {
                return this.processCSV(csv, finalChunk);
            }
            else {
                return Promise.resolve([]);
            }
        });
    }
    processCSV(csv, finalChunk) {
        const params = this.params;
        const runtime = this.runtime;
        if (!runtime.eol) {
            (0, getEol_1.default)(csv, runtime);
        }
        if (this.needEmitEol && !this.eolEmitted && runtime.eol) {
            this.converter.emit("eol", runtime.eol);
            this.eolEmitted = true;
        }
        // trim csv file has initial blank lines.
        if (params.ignoreEmpty && !runtime.started) {
            csv = csv.trimStart();
        }
        const stringToLineResult = (0, fileline_1.stringToLines)(csv, runtime);
        if (!finalChunk) {
            this.prependLeftBuf((0, util_1.bufFromString)(stringToLineResult.partial));
        }
        else {
            stringToLineResult.lines.push(stringToLineResult.partial);
            stringToLineResult.partial = "";
        }
        if (stringToLineResult.lines.length > 0) {
            let prom;
            if (runtime.preFileLineHook) {
                prom = this.runPreLineHook(stringToLineResult.lines);
            }
            else {
                prom = Promise.resolve(stringToLineResult.lines);
            }
            return prom.then((lines) => {
                if (!runtime.started && !this.runtime.headers) {
                    return this.processDataWithHead(lines);
                }
                else {
                    return this.processCSVBody(lines);
                }
            });
        }
        else {
            return Promise.resolve([]);
        }
    }
    processDataWithHead(lines) {
        if (this.params.noheader) {
            if (this.params.headers) {
                this.runtime.headers = this.params.headers;
            }
            else {
                this.runtime.headers = [];
            }
        }
        else {
            let left = "";
            let headerRow = [];
            while (lines?.length) {
                const line = left + lines.shift();
                const row = this.rowSplit.parse(line);
                if (row.closed) {
                    headerRow = row.cells;
                    left = "";
                    break;
                }
                else {
                    left = line + (0, getEol_1.default)(line, this.runtime);
                }
            }
            this.prependLeftBuf((0, util_1.bufFromString)(left));
            if (headerRow.length === 0) {
                return [];
            }
            if (this.params.headers) {
                this.runtime.headers = this.params.headers;
            }
            else {
                this.runtime.headers = headerRow;
            }
        }
        if (this.runtime.needProcessIgnoreColumn ||
            this.runtime.needProcessIncludeColumn) {
            this.filterHeader();
        }
        if (this.needEmitHead && !this.headEmitted) {
            this.converter.emit("header", this.runtime.headers);
            this.headEmitted = true;
        }
        return this.processCSVBody(lines);
    }
    filterHeader() {
        this.runtime.selectedColumns = [];
        if (this.runtime.headers) {
            const headers = this.runtime.headers;
            for (let i = 0; i < headers.length; i++) {
                if (this.params.ignoreColumns) {
                    if (this.params.ignoreColumns.test(headers[i])) {
                        if (this.params.includeColumns &&
                            this.params.includeColumns.test(headers[i])) {
                            this.runtime.selectedColumns.push(i);
                        }
                        else {
                        }
                    }
                    else {
                        this.runtime.selectedColumns.push(i);
                    }
                }
                else if (this.params.includeColumns) {
                    if (this.params.includeColumns.test(headers[i])) {
                        this.runtime.selectedColumns.push(i);
                    }
                }
                else {
                    this.runtime.selectedColumns.push(i);
                }
            }
            this.runtime.headers = (0, util_1.filterArray)(this.runtime.headers, this.runtime.selectedColumns);
        }
    }
    processCSVBody(lines) {
        if (this.params.output === "line") {
            return lines;
        }
        else {
            const result = this.rowSplit.parseMultiLines(lines);
            this.prependLeftBuf((0, util_1.bufFromString)(result.partial));
            if (this.params.output === "csv") {
                return result.rowsCells;
            }
            else {
                return (0, lineToJson_1.default)(result.rowsCells, this.converter);
            }
        }
    }
    prependLeftBuf(buf) {
        if (buf) {
            if (this.runtime.csvLineBuffer) {
                this.runtime.csvLineBuffer = Buffer.concat([
                    buf,
                    this.runtime.csvLineBuffer
                ]);
            }
            else {
                this.runtime.csvLineBuffer = buf;
            }
        }
    }
    runPreLineHook(lines) {
        return new Promise((resolve, reject) => {
            processLineHook(lines, this.runtime, 0, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(lines);
                }
            });
        });
    }
}
exports.ProcessorLocal = ProcessorLocal;
function processLineHook(lines, runtime, offset, cb) {
    if (offset >= lines.length) {
        cb();
    }
    else {
        if (runtime.preFileLineHook) {
            const line = lines[offset];
            const res = runtime.preFileLineHook(line, runtime.parsedLineNumber + offset);
            offset++;
            if (res && res.then) {
                res.then((value) => {
                    lines[offset - 1] = value;
                    processLineHook(lines, runtime, offset, cb);
                });
            }
            else {
                lines[offset - 1] = res;
                while (offset < lines.length) {
                    lines[offset] = runtime.preFileLineHook(lines[offset], runtime.parsedLineNumber + offset);
                    offset++;
                }
                cb();
            }
        }
        else {
            cb();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvY2Vzc29yTG9jYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvUHJvY2Vzc29yTG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkNBQTJEO0FBQzNELDJDQUEwQztBQUMxQyxzREFBOEI7QUFDOUIseUNBQTJDO0FBQzNDLGlDQUFvRDtBQUNwRCx5Q0FBc0M7QUFDdEMsOERBQXNDO0FBRXRDLDBEQUFrQztBQUVsQyxNQUFhLGNBQWUsU0FBUSxxQkFBUztJQUMzQyxLQUFLLENBQUMsS0FBSztRQUNULElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUF3QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNwRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztZQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDdkMsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxJQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBd0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BGLE1BQU0sa0JBQVEsQ0FBQyxjQUFjLENBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBd0IsQ0FBQyxRQUFRLEVBQUUsQ0FDbEQsQ0FBQztZQUNKLENBQUM7aUJBQU0sQ0FBQztnQkFDTixPQUFPLEdBQUcsQ0FBQztZQUNiLENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPO1FBQ0wsT0FBTyxPQUFPLENBQUMsT0FB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