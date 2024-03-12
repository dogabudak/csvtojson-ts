import assert from "assert";
import { bufFromString } from "../../src/util";

describe("bufFromString function", () => {
  it("should return an empty Buffer object when passed an empty string", () => {
    const str = "";
    const result = bufFromString(str);
    assert.equal(result.length, 0);
  });
});
