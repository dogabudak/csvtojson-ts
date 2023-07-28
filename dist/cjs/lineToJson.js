'use strict';Object.defineProperty(exports,'__esModule',{value:true});const CSVError=require('./CSVError.js'),set=require('lodash/set');const numReg = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;
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
        throw CSVError.default.column_mismatched(conv.parseRuntime.parsedLineNumber + index);
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
}exports.default=lineToJson;//# sourceMappingURL=lineToJson.js.map
