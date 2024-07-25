"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUtf8Split = exports.prepareData = void 0;
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
exports.prepareData = prepareData;
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
exports.cleanUtf8Split = cleanUtf8Split;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YUNsZWFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RhdGFDbGVhbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSwwREFBaUM7QUFFakMsU0FBZ0IsV0FBVyxDQUFDLEtBQWEsRUFBRSxPQUFxQjtJQUM5RCxNQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xELE9BQU8sQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO0lBQ2xDLE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQ3BCLE9BQU8sSUFBQSxtQkFBUSxFQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ2pDO1NBQU07UUFDTCxPQUFPLGNBQWMsQ0FBQztLQUN2QjtBQUNILENBQUM7QUFURCxrQ0FTQztBQUNELFNBQVMsZUFBZSxDQUFDLEtBQWEsRUFBRSxPQUFxQjtJQUMzRCxJQUFJLE9BQU8sQ0FBQyxhQUFhLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQzdELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUN0RDtTQUFNO1FBQ0wsT0FBTyxLQUFLLENBQUM7S0FDZDtBQUNILENBQUM7QUFDRCxTQUFnQixjQUFjLENBQUMsS0FBYSxFQUFFLE9BQXFCO0lBQ2pFLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUN0QyxHQUFHLEVBQUUsQ0FBQztTQUNQO1FBQ0QsR0FBRyxFQUFFLENBQUM7S0FDUDtJQUNELElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEQsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDbkM7U0FBTTtRQUNMLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDSCxDQUFDO0FBZEQsd0NBY0MifQ==