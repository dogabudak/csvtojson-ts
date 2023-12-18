import {processRecursive, Result} from "../../src/Result";
import { Converter } from "../../src/Converter";
import assert from "assert";
import {ProcessLineResult} from "../../src/Processor";

describe("Result", () => {
  it("should return need push downstream based on needEmitAll parameter", function () {
    const conv = new Converter();
    const res = new Result(conv);
    assert.equal(res["needEmitAll"], false);
    conv.then();
    assert.equal(res["needEmitAll"], true);
    conv.parseParam.needEmitAll = false;
    assert.equal(res["needEmitAll"], false);
  });
  it('should call pushDownstream when needPushDownstream is true', () => {
    const lines: ProcessLineResult[] = ["line1", "line2", "line3"];
    const hook = (data: any, lineNumber: number) => {
      console.log(`Processing line ${lineNumber}: ${data}`);
    };
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
    processRecursive(lines, hook, conv, offset, needPushDownstream, cb, res);
  });
});
