'use strict';function mergeParams(params) {
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
}exports.mergeParams=mergeParams;//# sourceMappingURL=Parameters.js.map
