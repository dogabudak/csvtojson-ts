import getEol from "./getEol";
import { filterArray } from "./util";
const defaultDelimiters = [",", "|", "\t", ";", ":"];
export class RowSplit {
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
//# sourceMappingURL=rowSplit.js.map