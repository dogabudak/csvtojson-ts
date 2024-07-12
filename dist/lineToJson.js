"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicType = exports.stringType = exports.numberType = exports.checkType = void 0;
const CSVError_1 = __importDefault(require("./CSVError"));
const set_1 = __importDefault(require("lodash/set"));
const numReg = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;
function default_1(csvRows, conv) {
    const res = [];
    for (let i = 0, len = csvRows.length; i < len; i++) {
        const r = processRow(csvRows[i], conv, i);
        if (r) {
            res.push(r);
        }
    }
    return res;
}
exports.default = default_1;
function processRow(row, conv, index) {
    if (conv.parseParam.checkColumn &&
        conv.parseRuntime.headers &&
        row.length !== conv.parseRuntime.headers.length) {
        throw CSVError_1.default.column_mismatched(conv.parseRuntime.parsedLineNumber + index);
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
                    if (headCom?.length === 0) {
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
    (0, set_1.default)(resultJson, head, value);
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
exports.checkType = checkType;
function numberType(item) {
    const rtn = parseFloat(item);
    if (isNaN(rtn)) {
        return item;
    }
    return rtn;
}
exports.numberType = numberType;
function stringType(item) {
    return item.toString();
}
exports.stringType = stringType;
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
exports.dynamicType = dynamicType;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVRvSnNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9saW5lVG9Kc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLDBEQUFrQztBQUVsQyxxREFBNkI7QUFFN0IsTUFBTSxNQUFNLEdBQUcsMENBQTBDLENBQUM7QUFFMUQsbUJBQXlCLE9BQW1CLEVBQUUsSUFBZTtJQUMzRCxNQUFNLEdBQUcsR0FBaUIsRUFBRSxDQUFDO0lBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEQsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLEVBQUU7WUFDTCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2I7S0FDRjtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQVRELDRCQVNDO0FBS0QsU0FBUyxVQUFVLENBQ2pCLEdBQWEsRUFDYixJQUFlLEVBQ2YsS0FBYTtJQUViLElBQ0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXO1FBQzNCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTztRQUN6QixHQUFHLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFDL0M7UUFDQSxNQUFNLGtCQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsQ0FBQztLQUM5RTtJQUVELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUNoRCxNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsT0FB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