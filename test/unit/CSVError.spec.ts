import { expect } from "chai";
import CSVError from "../../src/CSVError";

describe("CSV error file tests", () => {
  describe("constructor", () => {
    it("should create CSVError with required parameters", () => {
      const error = new CSVError("test_error", 10);

      expect(error).to.be.instanceOf(CSVError);
      expect(error).to.be.instanceOf(Error);
      expect(error.err).to.equal("test_error");
      expect(error.line).to.equal(10);
      expect(error.extra).to.be.undefined;
      expect(error.name).to.equal("CSV Parse Error");
      expect(error.message).to.equal("Error: test_error. JSON Line number: 10");
    });

    it("should create CSVError with extra parameter", () => {
      const error = new CSVError("test_error", 5, "additional info");

      expect(error.err).to.equal("test_error");
      expect(error.line).to.equal(5);
      expect(error.extra).to.equal("additional info");
      expect(error.message).to.equal("Error: test_error. JSON Line number: 5 near: additional info");
    });

    it("should format error message correctly without extra info", () => {
      const error = new CSVError("parsing_failed", 15);
      expect(error.message).to.equal("Error: parsing_failed. JSON Line number: 15");
    });

    it("should format error message correctly with extra info", () => {
      const error = new CSVError("invalid_format", 22, "unexpected character");
      expect(error.message).to.equal("Error: invalid_format. JSON Line number: 22 near: unexpected character");
    });
  });

  describe("static factory methods", () => {
    describe("column_mismatched", () => {
      it("should create column_mismatched error without extra info", () => {
        const error = CSVError.column_mismatched(7);

        expect(error).to.be.instanceOf(CSVError);
        expect(error.err).to.equal("column_mismatched");
        expect(error.line).to.equal(7);
        expect(error.extra).to.be.undefined;
        expect(error.message).to.equal("Error: column_mismatched. JSON Line number: 7");
      });

      it("should create column_mismatched error with extra info", () => {
        const error = CSVError.column_mismatched(12, "expected 3 columns, got 5");

        expect(error.err).to.equal("column_mismatched");
        expect(error.line).to.equal(12);
        expect(error.extra).to.equal("expected 3 columns, got 5");
        expect(error.message).to.equal("Error: column_mismatched. JSON Line number: 12 near: expected 3 columns, got 5");
      });
    });

    describe("unclosed_quote", () => {
      it("should create unclosed_quote error without extra info", () => {
        const error = CSVError.unclosed_quote(3);

        expect(error).to.be.instanceOf(CSVError);
        expect(error.err).to.equal("unclosed_quote");
        expect(error.line).to.equal(3);
        expect(error.extra).to.be.undefined;
        expect(error.message).to.equal("Error: unclosed_quote. JSON Line number: 3");
      });

      it("should create unclosed_quote error with extra info", () => {
        const error = CSVError.unclosed_quote(8, 'missing closing quote for "value');

        expect(error.err).to.equal("unclosed_quote");
        expect(error.line).to.equal(8);
        expect(error.extra).to.equal('missing closing quote for "value');
        expect(error.message).to.equal('Error: unclosed_quote. JSON Line number: 8 near: missing closing quote for "value');
      });
    });
  });

  describe("fromJSON", () => {
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

    it("should create CSVError from JSON object without extra field", () => {
      const obj = {
        err: "parsing_error",
        line: 20,
        extra: undefined
      };
      const result = CSVError.fromJSON(obj);

      expect(result.err).to.equal("parsing_error");
      expect(result.line).to.equal(20);
      expect(result.extra).to.be.undefined;
      expect(result.message).to.equal("Error: parsing_error. JSON Line number: 20");
    });

    it("should handle different error types from JSON", () => {
      const errorTypes = [
        { err: "column_mismatched", line: 1, extra: "test1" },
        { err: "unclosed_quote", line: 2, extra: "test2" },
        { err: "invalid_delimiter", line: 3, extra: "test3" }
      ];

      errorTypes.forEach(obj => {
        const result = CSVError.fromJSON(obj);
        expect(result.err).to.equal(obj.err);
        expect(result.line).to.equal(obj.line);
        expect(result.extra).to.equal(obj.extra);
      });
    });

    it("should create error with numeric and string line numbers", () => {
      const objWithNumber = { err: "test", line: 42, extra: null };
      const objWithString = { err: "test", line: "25" as any, extra: null };

      const resultNumber = CSVError.fromJSON(objWithNumber);
      const resultString = CSVError.fromJSON(objWithString);

      expect(resultNumber.line).to.equal(42);
      expect(resultString.line).to.equal("25");
    });
  });

  describe("inheritance", () => {
    it("should be instance of Error", () => {
      const error = new CSVError("test", 1);
      expect(error).to.be.instanceOf(Error);
    });

    it("should have correct prototype chain", () => {
      const error = new CSVError("test", 1);
      expect(error.constructor).to.equal(CSVError);
      expect(Object.getPrototypeOf(error)).to.equal(CSVError.prototype);
    });

    it("should be catchable as Error", () => {
      try {
        throw new CSVError("test_error", 1);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error).to.be.instanceOf(CSVError);
      }
    });
  });

  describe("error properties", () => {
    it("should maintain error properties through different creation methods", () => {
      const directError = new CSVError("direct", 1, "direct extra");
      const factoryError = CSVError.column_mismatched(2, "factory extra");
      const jsonError = CSVError.fromJSON({ err: "json", line: 3, extra: "json extra" });

      [directError, factoryError, jsonError].forEach(error => {
        expect(error.name).to.equal("CSV Parse Error");
        expect(error).to.have.property("err");
        expect(error).to.have.property("line");
        expect(error).to.have.property("message");
        expect(error).to.have.property("stack");
      });
    });

    it("should handle edge cases for line numbers", () => {
      const zeroLine = new CSVError("test", 0);
      const negativeLine = new CSVError("test", -1);
      const largeLine = new CSVError("test", 999999);

      expect(zeroLine.line).to.equal(0);
      expect(negativeLine.line).to.equal(-1);
      expect(largeLine.line).to.equal(999999);
    });

    it("should handle empty and whitespace extra messages", () => {
      const emptyExtra = new CSVError("test", 1, "");
      const whitespaceExtra = new CSVError("test", 1, "   ");

      // Empty string is falsy, so it doesn't add "near:" part
      expect(emptyExtra.message).to.equal("Error: test. JSON Line number: 1");
      expect(whitespaceExtra.message).to.equal("Error: test. JSON Line number: 1 near:    ");
    });
  });
});
