'use strict';Object.defineProperty(exports,'__esModule',{value:true});class CSVError extends Error {
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
}exports.default=CSVError;//# sourceMappingURL=CSVError.js.map
