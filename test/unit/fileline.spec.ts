import { stringToLines } from "../../src/fileline";
import { Converter } from "../../src/Converter";
import assert from "assert";
describe("fileline function", function () {
  it("should convert data to multiple lines ", function () {
    const conv = new Converter();
    const data = "abcde\nefef";
    const result = stringToLines(data, conv.parseRuntime);
    assert.equal(result.lines.length, 1);
    assert.equal(result.partial, "efef");
    assert.equal(result.lines[0], "abcde");
  });
});
