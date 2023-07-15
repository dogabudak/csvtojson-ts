import getEol from "./getEol";
export function stringToLines(data, param) {
    const eol = getEol(data, param);
    const lines = data.split(eol);
    const partial = lines.pop() || "";
    return { lines: lines, partial: partial };
}
//# sourceMappingURL=fileline.js.map