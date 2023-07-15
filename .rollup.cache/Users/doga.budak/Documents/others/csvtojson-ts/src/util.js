export function bufFromString(str) {
    const length = Buffer.byteLength(str);
    const buffer = Buffer.allocUnsafe
        ? Buffer.allocUnsafe(length)
        : new Buffer(length);
    buffer.write(str);
    return buffer;
}
export function emptyBuffer() {
    return Buffer.allocUnsafe ? Buffer.allocUnsafe(0) : new Buffer(0);
}
export function filterArray(arr, filter) {
    const rtn = [];
    for (let i = 0; i < arr.length; i++) {
        if (filter.indexOf(i) > -1) {
            rtn.push(arr[i]);
        }
    }
    return rtn;
}
//# sourceMappingURL=util.js.map