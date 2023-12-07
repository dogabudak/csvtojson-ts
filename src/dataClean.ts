import { ParseRuntime } from "./ParseRuntime";
import stripBom from "strip-bom";

export function prepareData(chunk: Buffer, runtime: ParseRuntime): string {
  const workChunk = concatLeftChunk(chunk, runtime);
  runtime.csvLineBuffer = undefined;
  const cleanCSVString = cleanUtf8Split(workChunk, runtime).toString("utf8");
  if (!runtime.started) {
    return stripBom(cleanCSVString);
  } else {
    return cleanCSVString;
  }
}
function concatLeftChunk(chunk: Buffer, runtime: ParseRuntime): Buffer {
  if (runtime.csvLineBuffer && runtime.csvLineBuffer.length > 0) {
    return Buffer.concat([runtime.csvLineBuffer, chunk]);
  } else {
    return chunk;
  }
}
function cleanUtf8Split(chunk: Buffer, runtime: ParseRuntime): Buffer {
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
  } else {
    return chunk;
  }
}
