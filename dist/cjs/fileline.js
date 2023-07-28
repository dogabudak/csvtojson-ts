'use strict';const getEol=require('./getEol.js');function stringToLines(data, param) {
    const eol = getEol.default(data, param);
    const lines = data.split(eol);
    const partial = lines.pop() || "";
    return { lines: lines, partial: partial };
}exports.stringToLines=stringToLines;//# sourceMappingURL=fileline.js.map
