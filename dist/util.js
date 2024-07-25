"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterArray = exports.bufFromString = void 0;
function bufFromString(str) {
    const length = Buffer.byteLength(str);
    const buffer = Buffer.allocUnsafe
        ? Buffer.allocUnsafe(length)
        : new Buffer(length);
    buffer.write(str);
    return buffer;
}
exports.bufFromString = bufFromString;
function filterArray(arr, filter) {
    const rtn = [];
    for (let i = 0; i < arr.length; i++) {
        if (filter.indexOf(i) > -1) {
            rtn.push(arr[i]);
        }
    }
    return rtn;
}
exports.filterArray = filterArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLFNBQWdCLGFBQWEsQ0FBQyxHQUFXO0lBQ3ZDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVc7UUFDL0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFQRCxzQ0FPQztBQUVELFNBQWdCLFdBQVcsQ0FBQyxHQUFhLEVBQUUsTUFBZ0I7SUFDekQsTUFBTSxHQUFHLEdBQWEsRUFBRSxDQUFDO0lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ25DLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtZQUMxQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xCO0tBQ0Y7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFSRCxrQ0FRQyJ9