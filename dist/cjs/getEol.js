'use strict';Object.defineProperty(exports,'__esModule',{value:true});//return first eol found from a data chunk.
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
}exports.default=getEol;//# sourceMappingURL=getEol.js.map
