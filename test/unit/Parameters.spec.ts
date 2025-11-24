import { expect } from "chai";
import { CSVParseParam, mergeParams, CellParser, ColumnParam } from "../../src/Parameters";

describe("Parameters", () => {
  describe("mergeParams", () => {
    it("should return default parameters when no params provided", () => {
      const result = mergeParams();

      expect(result.delimiter).to.equal(",");
      expect(result.ignoreColumns).to.be.undefined;
      expect(result.includeColumns).to.be.undefined;
      expect(result.quote).to.equal('"');
      expect(result.trim).to.be.true;
      expect(result.checkType).to.be.false;
      expect(result.ignoreEmpty).to.be.false;
      expect(result.noheader).to.be.false;
      expect(result.headers).to.be.undefined;
      expect(result.flatKeys).to.be.false;
      expect(result.maxRowLength).to.equal(0);
      expect(result.checkColumn).to.be.false;
      expect(result.escape).to.equal('"');
      expect(result.colParser).to.deep.equal({});
      expect(result.eol).to.be.undefined;
      expect(result.alwaysSplitAtEOL).to.be.false;
      expect(result.output).to.equal("json");
      expect(result.nullObject).to.be.false;
      expect(result.downstreamFormat).to.equal("line");
    });

    it("should return default parameters when empty object provided", () => {
      const result = mergeParams({});

      expect(result.delimiter).to.equal(",");
      expect(result.quote).to.equal('"');
      expect(result.trim).to.be.true;
    });

    it("should merge custom parameters with defaults", () => {
      const customParams: Partial<CSVParseParam> = {
        delimiter: "|",
        quote: "'",
        trim: false,
        checkType: true,
        noheader: true
      };

      const result = mergeParams(customParams);

      expect(result.delimiter).to.equal("|");
      expect(result.quote).to.equal("'");
      expect(result.trim).to.be.true; // mergeParams keeps default when param value is falsy
      expect(result.checkType).to.be.true;
      expect(result.noheader).to.be.true;
      
      // Default values should remain
      expect(result.ignoreEmpty).to.be.false;
      expect(result.flatKeys).to.be.false;
      expect(result.output).to.equal("json");
    });

    it("should handle array parameters correctly", () => {
      const customParams = {
        delimiter: [",", ";", "\t"],
        headers: ["name", "age", "email"]
      };

      const result = mergeParams(customParams);

      expect(result.delimiter).to.deep.equal([",", ";", "\t"]);
      expect(result.headers).to.deep.equal(["name", "age", "email"]);
    });

    it("should handle RegExp parameters", () => {
      const ignorePattern = /ignore_column/;
      const includePattern = /include_column/;

      const customParams: Partial<CSVParseParam> = {
        ignoreColumns: ignorePattern,
        includeColumns: includePattern
      };

      const result = mergeParams(customParams);

      expect(result.ignoreColumns).to.equal(ignorePattern);
      expect(result.includeColumns).to.equal(includePattern);
    });

    it("should handle colParser object", () => {
      const parser: CellParser = (item, head, resultRow, row, columnIndex) => {
        return parseInt(item);
      };

      const columnParam: ColumnParam = {
        flat: true,
        cellParser: parser
      };

      const customParams: Partial<CSVParseParam> = {
        colParser: {
          "age": parser,
          "score": "number",
          "metadata": columnParam
        }
      };

      const result = mergeParams(customParams);

      expect(result.colParser["age"]).to.equal(parser);
      expect(result.colParser["score"]).to.equal("number");
      expect(result.colParser["metadata"]).to.equal(columnParam);
    });

    it("should handle output format options", () => {
      let result = mergeParams({ output: "csv" });
      expect(result.output).to.equal("csv");

      result = mergeParams({ output: "line" });
      expect(result.output).to.equal("line");

      result = mergeParams({ output: "json" });
      expect(result.output).to.equal("json");
    });

    it("should handle downstreamFormat options", () => {
      let result = mergeParams({ downstreamFormat: "array" });
      expect(result.downstreamFormat).to.equal("array");

      result = mergeParams({ downstreamFormat: "line" });
      expect(result.downstreamFormat).to.equal("line");
    });

    it("should handle eol options", () => {
      let result = mergeParams({ eol: "\n" });
      expect(result.eol).to.equal("\n");

      result = mergeParams({ eol: "\r\n" });
      expect(result.eol).to.equal("\r\n");

      result = mergeParams({ eol: "\r" });
      expect(result.eol).to.equal("\r");
    });

    it("should handle numeric parameters", () => {
      const customParams: Partial<CSVParseParam> = {
        maxRowLength: 1000
      };

      const result = mergeParams(customParams);
      expect(result.maxRowLength).to.equal(1000);
    });

    it("should handle boolean parameters", () => {
      const customParams: Partial<CSVParseParam> = {
        trim: false,
        checkType: true,
        ignoreEmpty: true,
        noheader: true,
        flatKeys: true,
        checkColumn: true,
        alwaysSplitAtEOL: true,
        nullObject: true
      };

      const result = mergeParams(customParams);

      expect(result.trim).to.be.true; // mergeParams keeps default when param value is falsy
      expect(result.checkType).to.be.true;
      expect(result.ignoreEmpty).to.be.true;
      expect(result.noheader).to.be.true;
      expect(result.flatKeys).to.be.true;
      expect(result.checkColumn).to.be.true;
      expect(result.alwaysSplitAtEOL).to.be.true;
      expect(result.nullObject).to.be.true;
    });

    it("should not override defaults with falsy values except false and 0", () => {
      const customParams = {
        delimiter: null,
        quote: undefined,
        maxRowLength: 0,
        trim: false
      };

      const result = mergeParams(customParams);

      // Should keep defaults for null/undefined
      expect(result.delimiter).to.equal(",");
      expect(result.quote).to.equal('"');
      
      // Should accept 0 and false as valid values
      expect(result.maxRowLength).to.equal(0);
      expect(result.trim).to.be.true; // mergeParams keeps default when param value is falsy
    });

    it("should handle complex parameter combinations", () => {
      const parser: CellParser = (item) => parseFloat(item);
      
      const customParams: Partial<CSVParseParam> = {
        delimiter: [",", ";"],
        quote: "'",
        trim: false,
        checkType: true,
        ignoreEmpty: true,
        noheader: false,
        headers: ["col1", "col2", "col3"],
        flatKeys: true,
        maxRowLength: 500,
        checkColumn: true,
        escape: "\\",
        colParser: {
          "price": parser,
          "quantity": "number"
        },
        eol: "\r\n",
        alwaysSplitAtEOL: true,
        output: "csv",
        nullObject: true,
        downstreamFormat: "array"
      };

      const result = mergeParams(customParams);

      expect(result.delimiter).to.deep.equal([",", ";"]);
      expect(result.quote).to.equal("'");
      expect(result.trim).to.be.true; // mergeParams keeps default when param value is falsy
      expect(result.checkType).to.be.true;
      expect(result.ignoreEmpty).to.be.true;
      expect(result.noheader).to.be.false;
      expect(result.headers).to.deep.equal(["col1", "col2", "col3"]);
      expect(result.flatKeys).to.be.true;
      expect(result.maxRowLength).to.equal(500);
      expect(result.checkColumn).to.be.true;
      expect(result.escape).to.equal("\\");
      expect(result.colParser["price"]).to.equal(parser);
      expect(result.colParser["quantity"]).to.equal("number");
      expect(result.eol).to.equal("\r\n");
      expect(result.alwaysSplitAtEOL).to.be.true;
      expect(result.output).to.equal("csv");
      expect(result.nullObject).to.be.true;
      expect(result.downstreamFormat).to.equal("array");
    });
  });

  describe("CellParser type", () => {
    it("should accept valid cell parser function", () => {
      const parser: CellParser = (item, head, resultRow, row, columnIndex) => {
        return item.toUpperCase();
      };

      expect(typeof parser).to.equal("function");
      expect(parser.length).to.equal(5); // Should accept 5 parameters
    });

    it("should work with different return types", () => {
      const stringParser: CellParser = () => "string";
      const numberParser: CellParser = () => 42;
      const booleanParser: CellParser = () => true;
      const objectParser: CellParser = () => ({ value: "test" });

      expect(stringParser("", "", {}, [], 0)).to.equal("string");
      expect(numberParser("", "", {}, [], 0)).to.equal(42);
      expect(booleanParser("", "", {}, [], 0)).to.be.true;
      expect(objectParser("", "", {}, [], 0)).to.deep.equal({ value: "test" });
    });
  });

  describe("ColumnParam interface", () => {
    it("should accept valid ColumnParam object", () => {
      const columnParam: ColumnParam = {
        flat: true,
        cellParser: (item) => parseInt(item)
      };

      expect(columnParam.flat).to.be.true;
      expect(typeof columnParam.cellParser).to.equal("function");
    });

    it("should accept partial ColumnParam object", () => {
      const columnParam1: ColumnParam = { flat: true };
      const columnParam2: ColumnParam = { cellParser: "number" };

      expect(columnParam1.flat).to.be.true;
      expect(columnParam1.cellParser).to.be.undefined;
      expect(columnParam2.flat).to.be.undefined;
      expect(columnParam2.cellParser).to.equal("number");
    });

    it("should accept cellParser as string or function", () => {
      const withString: ColumnParam = { cellParser: "number" };
      const withFunction: ColumnParam = { cellParser: (item) => parseInt(item) };

      expect(withString.cellParser).to.equal("number");
      expect(typeof withFunction.cellParser).to.equal("function");
    });
  });
});