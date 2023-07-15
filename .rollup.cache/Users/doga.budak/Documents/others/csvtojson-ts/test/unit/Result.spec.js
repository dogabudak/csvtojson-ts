import { Result } from "../../src/Result";
import { Converter } from "../../src/Converter";
import assert from "assert";
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
});
//# sourceMappingURL=Result.spec.js.map