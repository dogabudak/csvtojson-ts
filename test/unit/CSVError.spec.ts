import { expect } from "chai";
import CSVError from "../../src/CSVError";

describe("CSV error file tests", () => {
  it("should create a new instance of CSVError with the correct parameters from a valid JSON object", () => {
    const obj = {
      err: "column_mismatched",
      line: 5,
      extra: "extra info"
    };
    const result = CSVError.fromJSON(obj);

    expect(result).to.be.an.instanceOf(CSVError);
    expect(result.err).to.equal(obj.err);
    expect(result.line).to.equal(obj.line);
    expect(result.extra).to.equal(obj.extra);
  });
});
