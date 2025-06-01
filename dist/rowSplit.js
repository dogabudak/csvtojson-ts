"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowSplit = void 0;
const getEol_1 = __importDefault(require("./getEol"));
const util_1 = require("./util");
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
        if (fileline.length === 0 || (this.conv.parseParam.ignoreEmpty && fileline.trim().length === 0)) {
            return { cells: [], closed: true };
        }
        if (Array.isArray(this.conv.parseRuntime.delimiter) || this.conv.parseRuntime.delimiter.toLowerCase() === "auto") {
            this.conv.parseRuntime.delimiter = this.getDelimiter(fileline);
        }
        if (this.needEmitDelimiter && !this.delimiterEmitted) {
            this.conv.emit("delimiter", this.conv.parseRuntime.delimiter);
            this.delimiterEmitted = true;
        }
        const delimiter = Array.isArray(this.conv.parseRuntime.delimiter)
            ? this.conv.parseRuntime.delimiter[0]
            : this.conv.parseRuntime.delimiter;
        const rowArr = fileline.split(delimiter);
        if (this.quote === "off") {
            if (this.trim) {
                for (let i = 0; i < rowArr.length; i++) {
                    rowArr[i] = rowArr[i].trim();
                }
            }
            return { cells: rowArr, closed: true };
        }
        return this.toCSVRow(rowArr, this.trim, this.quote, delimiter);
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
                        e = e.substring(0, e.lastIndexOf(quote));
                        e = this.escapeQuote(e);
                        row.push(e);
                    }
                    else if (e.indexOf(quote) !== -1) {
                        let count = 0;
                        let prev = "";
                        for (const c of e) {
                            if (c === quote && prev !== this.escape) {
                                count++;
                                prev = "";
                            }
                            else {
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
                    e = e.substring(0, len - 1);
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
                    csvLines.push((0, util_1.filterArray)(row.cells, this.conv.parseRuntime.selectedColumns));
                }
                else {
                    csvLines.push(row.cells);
                }
                left = "";
            }
            else {
                left = this.parseOpenLines(line);
            }
        }
        return { rowsCells: csvLines, partial: left };
    }
    parseOpenLines(line) {
        return line + ((0, getEol_1.default)(line, this.conv.parseRuntime) || "\n");
    }
}
exports.RowSplit = RowSplit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93U3BsaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcm93U3BsaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsc0RBQThCO0FBQzlCLGlDQUFxQztBQUVyQyxNQUFNLGlCQUFpQixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRXJELE1BQWEsUUFBUTtJQWVDO0lBZFosS0FBSyxDQUFTO0lBQ2QsSUFBSSxDQUFVO0lBQ2QsTUFBTSxDQUFTO0lBQ2YsWUFBWSxHQUE4QixFQUFFLENBQUM7SUFDN0MsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLGtCQUFrQixHQUFhLFNBQVMsQ0FBQztJQUVqRCxJQUFZLGlCQUFpQjtRQUMzQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7SUFDakMsQ0FBQztJQUVELFlBQW9CLElBQWU7UUFBZixTQUFJLEdBQUosSUFBSSxDQUFXO1FBQ2pDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDbkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBa0I7UUFDdEIsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdB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