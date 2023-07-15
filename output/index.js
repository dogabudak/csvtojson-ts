'use strict';

var node_fs = require('node:fs');
var stream = require('stream');
var stripBom = require('strip-bom');
var set = require('lodash/set');
var os = require('os');

function mergeParams(params) {
    const defaultParam = {
        delimiter: ",",
        ignoreColumns: undefined,
        includeColumns: undefined,
        quote: '"',
        trim: true,
        checkType: false,
        ignoreEmpty: false,
        noheader: false,
        headers: undefined,
        flatKeys: false,
        maxRowLength: 0,
        checkColumn: false,
        escape: '"',
        colParser: {},
        eol: undefined,
        alwaysSplitAtEOL: false,
        output: "json",
        nullObject: false,
        downstreamFormat: "line",
        needEmitAll: true
    };
    if (!params) {
        params = {};
    }
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            if (Array.isArray(params[key])) {
                // @ts-ignore
                defaultParam[key] = [].concat(params[key]);
            }
            else {
                // @ts-ignore
                defaultParam[key] = params[key];
            }
        }
    }
    return defaultParam;
}

function initParseRuntime(converter) {
    const params = converter.parseParam;
    const rtn = {
        needProcessIgnoreColumn: false,
        needProcessIncludeColumn: false,
        selectedColumns: undefined,
        ended: false,
        hasError: false,
        error: undefined,
        delimiter: converter.parseParam.delimiter,
        eol: converter.parseParam.eol,
        columnConv: [],
        headerType: [],
        headerTitle: [],
        headerFlag: [],
        headers: undefined,
        started: false,
        parsedLineNumber: 0,
        columnValueSetter: []
    };
    if (params.ignoreColumns) {
        rtn.needProcessIgnoreColumn = true;
    }
    if (params.includeColumns) {
        rtn.needProcessIncludeColumn = true;
    }
    return rtn;
}

class Processor {
    converter;
    params;
    runtime;
    constructor(converter) {
        this.converter = converter;
        this.params = converter.parseParam;
        this.runtime = converter.parseRuntime;
    }
}

function prepareData(chunk, runtime) {
    const workChunk = concatLeftChunk(chunk, runtime);
    runtime.csvLineBuffer = undefined;
    const cleanCSVString = cleanUtf8Split(workChunk, runtime).toString("utf8");
    if (!runtime.started) {
        return stripBom(cleanCSVString);
    }
    else {
        return cleanCSVString;
    }
}
function concatLeftChunk(chunk, runtime) {
    if (runtime.csvLineBuffer && runtime.csvLineBuffer.length > 0) {
        return Buffer.concat([runtime.csvLineBuffer, chunk]);
    }
    else {
        return chunk;
    }
}
function cleanUtf8Split(chunk, runtime) {
    let idx = chunk.length - 1;
    if ((chunk[idx] & (1 << 7)) != 0) {
        while ((chunk[idx] & (3 << 6)) === 128) {
            idx--;
        }
        idx--;
    }
    if (idx != chunk.length - 1) {
        runtime.csvLineBuffer = chunk.slice(idx + 1);
        return chunk.slice(0, idx + 1);
    }
    else {
        return chunk;
    }
}

//return first eol found from a data chunk.
function getEol (data, param) {
    if (!param.eol && data) {
        for (let i = 0, len = data.length; i < len; i++) {
            if (data[i] === "\r") {
                if (data[i + 1] === "\n") {
                    param.eol = "\r\n";
                    break;
                }
                else if (data[i + 1]) {
                    param.eol = "\r";
                    break;
                }
            }
            else if (data[i] === "\n") {
                param.eol = "\n";
                break;
            }
        }
    }
    return param.eol || "\n";
}

function stringToLines(data, param) {
    const eol = getEol(data, param);
    const lines = data.split(eol);
    const partial = lines.pop() || "";
    return { lines: lines, partial: partial };
}

function bufFromString(str) {
    const length = Buffer.byteLength(str);
    const buffer = Buffer.allocUnsafe
        ? Buffer.allocUnsafe(length)
        : new Buffer(length);
    buffer.write(str);
    return buffer;
}
function filterArray(arr, filter) {
    const rtn = [];
    for (let i = 0; i < arr.length; i++) {
        if (filter.indexOf(i) > -1) {
            rtn.push(arr[i]);
        }
    }
    return rtn;
}

const defaultDelimiters = [",", "|", "\t", ";", ":"];
class RowSplit {
    conv;
    quote;
    trim;
    escape;
    cachedRegExp = {};
    delimiterEmitted = false;
    _needEmitDelimiter = undefined;
    get needEmitDelimiter() {
        if (this._needEmitDelimiter === undefined) {
            this._needEmitDelimiter = this.conv.listeners("delimiter").length > 0;
        }
        return this._needEmitDelimiter;
    }
    constructor(conv) {
        this.conv = conv;
        this.quote = conv.parseParam.quote;
        this.trim = conv.parseParam.trim;
        this.escape = conv.parseParam.escape;
    }
    parse(fileline) {
        if (fileline.length === 0 ||
            (this.conv.parseParam.ignoreEmpty && fileline.trim().length === 0)) {
            return { cells: [], closed: true };
        }
        const quote = this.quote;
        const trim = this.trim;
        if (this.conv.parseRuntime.delimiter instanceof Array ||
            this.conv.parseRuntime.delimiter.toLowerCase() === "auto") {
            this.conv.parseRuntime.delimiter = this.getDelimiter(fileline);
        }
        if (this.needEmitDelimiter && !this.delimiterEmitted) {
            this.conv.emit("delimiter", this.conv.parseRuntime.delimiter);
            this.delimiterEmitted = true;
        }
        const delimiter = this.conv.parseRuntime.delimiter;
        const rowArr = fileline.split(delimiter);
        if (quote === "off") {
            if (trim) {
                for (let i = 0; i < rowArr.length; i++) {
                    rowArr[i] = rowArr[i].trim();
                }
            }
            return { cells: rowArr, closed: true };
        }
        else {
            return this.toCSVRow(rowArr, trim, quote, delimiter);
        }
    }
    toCSVRow(rowArr, trim, quote, delimiter) {
        const row = [];
        let inquote = false;
        let quoteBuff = "";
        for (let i = 0, rowLen = rowArr.length; i < rowLen; i++) {
            let e = rowArr[i];
            if (!inquote && trim) {
                e = e.trimStart();
            }
            const len = e.length;
            if (!inquote) {
                if (len === 2 && e === this.quote + this.quote) {
                    row.push("");
                }
                else if (this.isQuoteOpen(e)) {
                    e = e.substring(1);
                    if (this.isQuoteClose(e)) {
                        //quote close
                        e = e.substring(0, e.lastIndexOf(quote) + 1);
                        e = this.escapeQuote(e);
                        row.push(e);
                    }
                    else if (e.indexOf(quote) !== -1) {
                        let count = 0;
                        let prev = "";
                        for (const c of e) {
                            // count quotes only if previous character is not escape char
                            if (c === quote && prev !== this.escape) {
                                count++;
                                prev = "";
                            }
                            else {
                                // save previous char to temp variable
                                prev = c;
                            }
                        }
                        if (count % 2 === 1) {
                            if (trim) {
                                e = e.trimEnd();
                            }
                            row.push(quote + e);
                        }
                        else {
                            inquote = true;
                            quoteBuff += e;
                        }
                    }
                    else {
                        inquote = true;
                        quoteBuff += e;
                    }
                }
                else {
                    if (trim) {
                        e = e.trimEnd();
                    }
                    row.push(e);
                }
            }
            else {
                if (this.isQuoteClose(e)) {
                    inquote = false;
                    e = e.substring(0, len);
                    quoteBuff += delimiter + e;
                    quoteBuff = this.escapeQuote(quoteBuff);
                    if (trim) {
                        quoteBuff = quoteBuff.trimEnd();
                    }
                    row.push(quoteBuff);
                    quoteBuff = "";
                }
                else {
                    quoteBuff += delimiter + e;
                }
            }
        }
        return { cells: row, closed: !inquote };
    }
    getDelimiter(fileline) {
        let possibleDelimiters;
        if (this.conv.parseParam.delimiter === "auto") {
            possibleDelimiters = defaultDelimiters;
        }
        else if (this.conv.parseParam.delimiter instanceof Array) {
            possibleDelimiters = this.conv.parseParam.delimiter;
        }
        else {
            return this.conv.parseParam.delimiter;
        }
        let count = 0;
        let delimiter = ",";
        possibleDelimiters.forEach(function (delim) {
            const delimCount = fileline.split(delim).length;
            if (delimCount > count) {
                delimiter = delim;
                count = delimCount;
            }
        });
        return delimiter;
    }
    isQuoteOpen(str) {
        const quote = this.quote;
        const escape = this.escape;
        return (str[0] === quote &&
            (str[1] !== quote ||
                (str[1] === escape && (str[2] === quote || str.length === 2))));
    }
    isQuoteClose(str) {
        const quote = this.quote;
        const escape = this.escape;
        if (this.conv.parseParam.trim) {
            str = str.trimEnd();
        }
        let count = 0;
        let idx = str.length - 1;
        while (str[idx] === quote || str[idx] === escape) {
            idx--;
            count++;
        }
        return count % 2 !== 0;
    }
    escapeQuote(segment) {
        const key = "es|" + this.quote + "|" + this.escape;
        if (this.cachedRegExp[key] === undefined) {
            this.cachedRegExp[key] = new RegExp("\\" + this.escape + "\\" + this.quote, "g");
        }
        const regExp = this.cachedRegExp[key];
        return segment.replace(regExp, this.quote);
    }
    parseMultiLines(lines) {
        const csvLines = [];
        let left = "";
        while (lines.length) {
            const line = left + lines.shift();
            const row = this.parse(line);
            if (row.cells.length === 0 && this.conv.parseParam.ignoreEmpty) {
                continue;
            }
            if (row.closed || this.conv.parseParam.alwaysSplitAtEOL) {
                if (this.conv.parseRuntime.selectedColumns) {
                    csvLines.push(filterArray(row.cells, this.conv.parseRuntime.selectedColumns));
                }
                else {
                    csvLines.push(row.cells);
                }
                left = "";
            }
            else {
                left = line + (getEol(line, this.conv.parseRuntime) || "\n");
            }
        }
        return { rowsCells: csvLines, partial: left };
    }
}

class CSVError extends Error {
    err;
    line;
    extra;
    static column_mismatched(index, extra) {
        return new CSVError("column_mismatched", index, extra);
    }
    static unclosed_quote(index, extra) {
        return new CSVError("unclosed_quote", index, extra);
    }
    static fromJSON(obj) {
        return new CSVError(obj.err, obj.line, obj.extra);
    }
    constructor(err, line, extra) {
        super("Error: " +
            err +
            ". JSON Line number: " +
            line +
            (extra ? " near: " + extra : ""));
        this.err = err;
        this.line = line;
        this.extra = extra;
        this.name = "CSV Parse Error";
    }
    toJSON() {
        return {
            err: this.err,
            line: this.line,
            extra: this.extra
        };
    }
}

const numReg = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;
function lineToJson (csvRows, conv) {
    const res = [];
    for (let i = 0, len = csvRows.length; i < len; i++) {
        const r = processRow(csvRows[i], conv, i);
        if (r) {
            res.push(r);
        }
    }
    return res;
}
function processRow(row, conv, index) {
    if (conv.parseParam.checkColumn &&
        conv.parseRuntime.headers &&
        row.length !== conv.parseRuntime.headers.length) {
        throw CSVError.column_mismatched(conv.parseRuntime.parsedLineNumber + index);
    }
    const headRow = conv.parseRuntime.headers || [];
    const resultRow = convertRowToJson(row, headRow, conv);
    if (resultRow) {
        return resultRow;
    }
    else {
        return null;
    }
}
function convertRowToJson(row, headRow, conv) {
    let hasValue = false;
    const resultRow = {};
    for (let i = 0, len = row.length; i < len; i++) {
        let item = row[i];
        if (conv.parseParam.ignoreEmpty && item === "") {
            continue;
        }
        hasValue = true;
        let head = headRow[i];
        if (!head || head === "") {
            head = headRow[i] = "field" + (i + 1);
        }
        const convFunc = getConvFunc(head, i, conv);
        if (convFunc) {
            const convRes = convFunc(item, head, resultRow, row, i);
            if (convRes !== undefined) {
                setPath(resultRow, head, convRes, conv, i);
            }
        }
        else {
            if (conv.parseParam.checkType) {
                const convertFunc = checkType(item, head, i, conv);
                item = convertFunc(item);
            }
            if (item !== undefined) {
                setPath(resultRow, head, item, conv, i);
            }
        }
    }
    if (hasValue) {
        return resultRow;
    }
    else {
        return null;
    }
}
const builtInConv = {
    string: stringType,
    number: numberType,
    omit: function () { }
};
function getConvFunc(head, i, conv) {
    if (conv.parseRuntime.columnConv[i] !== undefined) {
        return conv.parseRuntime.columnConv[i];
    }
    else {
        let flag = conv.parseParam.colParser[head];
        if (flag === undefined) {
            return (conv.parseRuntime.columnConv[i] = null);
        }
        if (typeof flag === "object") {
            flag = flag.cellParser || "string";
        }
        if (typeof flag === "string") {
            flag = flag.trim().toLowerCase();
            const builtInFunc = builtInConv[flag];
            if (builtInFunc) {
                return (conv.parseRuntime.columnConv[i] = builtInFunc);
            }
            else {
                return (conv.parseRuntime.columnConv[i] = null);
            }
        }
        else if (typeof flag === "function") {
            return (conv.parseRuntime.columnConv[i] = flag);
        }
        else {
            return (conv.parseRuntime.columnConv[i] = null);
        }
    }
}
function setPath(resultJson, head, value, conv, headIdx) {
    if (!conv.parseRuntime.columnValueSetter[headIdx]) {
        if (conv.parseParam.flatKeys) {
            conv.parseRuntime.columnValueSetter[headIdx] = flatSetter;
        }
        else {
            if (head.indexOf(".") > -1) {
                const headArr = head.split(".");
                let jsonHead = true;
                while (headArr.length > 0) {
                    const headCom = headArr.shift();
                    if (headCom.length === 0) {
                        jsonHead = false;
                        break;
                    }
                }
                if (!jsonHead ||
                    (conv.parseParam.colParser[head] &&
                        conv.parseParam.colParser[head].flat)) {
                    conv.parseRuntime.columnValueSetter[headIdx] = flatSetter;
                }
                else {
                    conv.parseRuntime.columnValueSetter[headIdx] = jsonSetter;
                }
            }
            else {
                conv.parseRuntime.columnValueSetter[headIdx] = flatSetter;
            }
        }
    }
    if (conv.parseParam.nullObject === true && value === "null") {
        value = null;
    }
    conv.parseRuntime.columnValueSetter[headIdx](resultJson, head, value);
    // flatSetter(resultJson, head, value);
}
function flatSetter(resultJson, head, value) {
    resultJson[head] = value;
}
function jsonSetter(resultJson, head, value) {
    set(resultJson, head, value);
}
function checkType(item, head, headIdx, conv) {
    if (conv.parseRuntime.headerType[headIdx]) {
        return conv.parseRuntime.headerType[headIdx];
    }
    else if (head.indexOf("number#!") > -1) {
        return (conv.parseRuntime.headerType[headIdx] = numberType);
    }
    else if (head.indexOf("string#!") > -1) {
        return (conv.parseRuntime.headerType[headIdx] = stringType);
    }
    else if (conv.parseParam.checkType) {
        return (conv.parseRuntime.headerType[headIdx] = dynamicType);
    }
    else {
        return (conv.parseRuntime.headerType[headIdx] = stringType);
    }
}
function numberType(item) {
    const rtn = parseFloat(item);
    if (isNaN(rtn)) {
        return item;
    }
    return rtn;
}
function stringType(item) {
    return item.toString();
}
function dynamicType(item) {
    const trimed = item.trim();
    if (trimed === "") {
        return stringType(item);
    }
    if (numReg.test(trimed)) {
        return numberType(item);
    }
    else if ((trimed.length === 5 && trimed.toLowerCase() === "false") ||
        (trimed.length === 4 && trimed.toLowerCase() === "true")) {
        return booleanType(item);
    }
    else if ((trimed[0] === "{" && trimed[trimed.length - 1] === "}") ||
        (trimed[0] === "[" && trimed[trimed.length - 1] === "]")) {
        return jsonType(item);
    }
    else {
        return stringType(item);
    }
}
function booleanType(item) {
    const trimmed = item.trim();
    return !(trimmed.length === 5 && trimmed.toLowerCase() === "false");
}
function jsonType(item) {
    try {
        return JSON.parse(item);
    }
    catch (e) {
        return item;
    }
}

class ProcessorLocal extends Processor {
    flush() {
        if (this.runtime.csvLineBuffer && this.runtime.csvLineBuffer.length > 0) {
            const buf = this.runtime.csvLineBuffer;
            this.runtime.csvLineBuffer = undefined;
            return this.process(buf, true).then((res) => {
                if (this.runtime.csvLineBuffer && this.runtime.csvLineBuffer.length > 0) {
                    return Promise.reject(CSVError.unclosed_quote(this.runtime.parsedLineNumber, this.runtime.csvLineBuffer.toString()));
                }
                else {
                    return Promise.resolve(res);
                }
            });
        }
        else {
            return Promise.resolve([]);
        }
    }
    destroy() {
        return Promise.resolve();
    }
    rowSplit = new RowSplit(this.converter);
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
            csvString = prepareData(chunk, this.converter.parseRuntime);
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
            getEol(csv, runtime);
        }
        if (this.needEmitEol && !this.eolEmitted && runtime.eol) {
            this.converter.emit("eol", runtime.eol);
            this.eolEmitted = true;
        }
        // trim csv file has initial blank lines.
        if (params.ignoreEmpty && !runtime.started) {
            csv = csv.trimStart();
        }
        const stringToLineResult = stringToLines(csv, runtime);
        if (!finalChunk) {
            this.prependLeftBuf(bufFromString(stringToLineResult.partial));
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
            while (lines.length) {
                const line = left + lines.shift();
                const row = this.rowSplit.parse(line);
                if (row.closed) {
                    headerRow = row.cells;
                    left = "";
                    break;
                }
                else {
                    left = line + getEol(line, this.runtime);
                }
            }
            this.prependLeftBuf(bufFromString(left));
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
                            continue;
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
                // if (this.params.includeColumns && this.params.includeColumns.test(headers[i])){
                //   this.runtime.selectedColumns.push(i);
                // }else{
                //   if (this.params.ignoreColumns && this.params.ignoreColumns.test(headers[i])){
                //     continue;
                //   }else{
                //     if (this.params.ignoreColumns && !this.params.includeColumns){
                //       this.runtime.selectedColumns.push(i);
                //     }
                //   }
                // }
            }
            this.runtime.headers = filterArray(this.runtime.headers, this.runtime.selectedColumns);
        }
    }
    processCSVBody(lines) {
        if (this.params.output === "line") {
            return lines;
        }
        else {
            const result = this.rowSplit.parseMultiLines(lines);
            this.prependLeftBuf(bufFromString(result.partial));
            if (this.params.output === "csv") {
                return result.rowsCells;
            }
            else {
                return lineToJson(result.rowsCells, this.converter);
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
}

class Converter extends stream.Transform {
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
        node_fs.access(filePath, node_fs.constants.F_OK, (err) => {
            if (!err) {
                // @ts-ignore
                const rs = node_fs.createReadStream(filePath, options);
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
        const read = new stream.Readable();
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

const helper = function (param, options) {
    return new Converter(param, options);
};
helper["csv"] = helper;
helper["Converter"] = Converter;

module.exports = helper;
