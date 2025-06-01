"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareData = prepareData;
exports.cleanUtf8Split = cleanUtf8Split;
const strip_bom_1 = __importDefault(require("strip-bom"));
function prepareData(chunk, runtime) {
    const workChunk = concatLeftChunk(chunk, runtime);
    runtime.csvLineBuffer = undefined;
    const cleanCSVString = cleanUtf8Split(workChunk, runtime).toString("utf8");
    if (!runtime.started) {
        return (0, strip_bom_1.default)(cleanCSVString);
    }
    else {
        return cleanCSVString;
    }
}
function concatLeftChunk(chunk, runtime) {
    if (runtime.csvLineBuffer && runtime.csvLineBuffer.length > 0) {
        return Buffer.concat([runtime.csvLineBuffer, chunk]);
    }
    else {
        return chunk;
    }
}
function cleanUtf8Split(chunk, runtime) {
    let idx = chunk.length - 1;
    if ((chunk[idx] & (1 << 7)) != 0) {
        while ((chunk[idx] & (3 << 6)) === 128) {
            idx--;
        }
        idx--;
    }
    if (idx != chunk.length - 1) {
        runtime.csvLineBuffer = chunk.subarray(idx + 1);
        return chunk.subarray(0, idx + 1);
    }
    else {
        return chunk;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YUNsZWFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RhdGFDbGVhbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUdBLGtDQVNDO0FBUUQsd0NBY0M7QUFqQ0QsMERBQWlDO0FBRWpDLFNBQWdCLFdBQVcsQ0FBQyxLQUFhLEVBQUUsT0FBcUI7SUFDOUQsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxPQUFPLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztJQUNsQyxNQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JCLE9BQU8sSUFBQSxtQkFBUSxFQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBTyxjQUFjLENBQUM7SUFDeEIsQ0FBQztBQUNILENBQUM7QUFDRCxTQUFTLGVBQWUsQ0FBQyxLQUFhLEVBQUUsT0FBcUI7SUFDM0QsSUFBSSxPQUFPLENBQUMsYUFBYSxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzlELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO1NBQU0sQ0FBQztRQUNOLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztBQUNILENBQUM7QUFDRCxTQUFnQixjQUFjLENBQUMsS0FBYSxFQUFFLE9BQXFCO0lBQ2pFLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDdkMsR0FBRyxFQUFFLENBQUM7UUFDUixDQUFDO1FBQ0QsR0FBRyxFQUFFLENBQUM7SUFDUixDQUFDO0lBQ0QsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM1QixPQUFPLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0FBQ0gsQ0FBQyJ9