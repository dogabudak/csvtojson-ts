export function bufFromString(str: string): Buffer {
  const length = Buffer.byteLength(str);
  const buffer = Buffer.allocUnsafe
    ? Buffer.allocUnsafe(length)
    : new Buffer(length);
  buffer.write(str);
  return buffer;
}

export function filterArray(arr: string[], filter: number[]): string[] {
  const rtn: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (filter.indexOf(i) > -1) {
      rtn.push(arr[i]);
    }
  }
  return rtn;
}
