import { processRecursive } from "../../src/Result";
import { Converter } from "../../src/Converter";
import { ProcessLineResult } from "../../src/Processor";

describe("Result", () => {
  it("should call pushDownstream when needPushDownstream is true", () => {
    const lines: ProcessLineResult[] = ["line1", "line2", "line3"];
    const conv = new Converter();
    const offset = 0;
    const needPushDownstream = true;
    const cb = (err?: any) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Processing completed");
      }
    };
    const res: ProcessLineResult = lines[offset];
    processRecursive(lines, conv, offset, needPushDownstream, cb, res);
  });
});
