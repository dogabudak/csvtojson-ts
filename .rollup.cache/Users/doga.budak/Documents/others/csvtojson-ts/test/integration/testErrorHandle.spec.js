import { Converter } from "../../src/Converter";
import assert from "assert";
import fs from "fs";
import path from "path";
const dir = path.resolve(path.dirname(__filename), "../");
describe("Converter error handling", function () {
    it("should handle quote not closed", function (done) {
        const rs = fs.createReadStream(dir + "/data/dataWithUnclosedQuotes");
        const conv = new Converter({});
        conv.on("error", function (err) {
            assert(err.err === "unclosed_quote");
            done();
        });
        rs.pipe(conv);
    });
    it("should handle column number mismatched error", function (done) {
        const rs = fs.createReadStream(dir + "/data/dataWithMismatchedColumn");
        const conv = new Converter({
            checkColumn: true
        });
        let tested = false;
        conv.on("error", function (err) {
            if (!tested) {
                assert(err.err === "column_mismatched");
                tested = true;
            }
        });
        conv.on("done", function () {
            assert(tested);
            done();
        });
        rs.pipe(conv);
    });
    it("should treat quote not closed as column_mismatched when alwaysSplitAtEOL is true", function (done) {
        const rs = fs.createReadStream(dir + "/data/dataWithUnclosedQuotes");
        const conv = new Converter({
            checkColumn: true,
            alwaysSplitAtEOL: true
        });
        let tested = false;
        conv.on("error", function (err) {
            if (!tested) {
                assert(err.err === "column_mismatched");
                tested = true;
            }
        });
        conv.on("done", function () {
            assert(tested);
            done();
        });
        rs.pipe(conv);
    });
});
//# sourceMappingURL=testErrorHandle.spec.js.map