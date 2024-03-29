import { RowSplit, MultipleRowResult, RowSplitResult } from "../../src/rowSplit";
import { Converter } from "../../src/Converter";
import assert from "assert";
import { Fileline } from "../../src/fileline";

describe("Test delimiters", function () {
  const getDelimiter = (
    str: string,
    opt: { delimiter: string | string[] }
  ): string => {
    return RowSplit.prototype["getDelimiter"].call(
      {
        conv: {
          parseParam: {
            delimiter: opt.delimiter
          }
        }
      },
      str
    );
  };

  it("should return the explicitly specified delimiter", function () {
    const delimiter = ";";
    const rowStr = "a;b;c";
    const returnedDelimiter = getDelimiter(rowStr, { delimiter: ";" });
    assert.equal(returnedDelimiter, delimiter);
  });

  it("should return the autodetected delimiter if 'auto' specified", function () {
    const rowStr = "a;b;c";
    const returnedDelimiter = getDelimiter(rowStr, { delimiter: "auto" });
    assert(returnedDelimiter === ";");
  });

  it("should return the ',' delimiter if delimiter cannot be specified, in case of 'auto'", function () {
    const rowStr = "abc";
    const returnedDelimiter = getDelimiter(rowStr, { delimiter: "auto" });
    assert(returnedDelimiter === ",");
  });

  it("should accept an array with potential delimiters", function () {
    const rowStr = "a$b$c";
    const returnedDelimiter = getDelimiter(rowStr, { delimiter: [",", ";", "$"] });
    assert(returnedDelimiter === "$");
  });
});

describe("ParseMultiLine function", function () {
  const rowSplit = new RowSplit(new Converter());
  const func = (lines: string[]): MultipleRowResult => {
    return rowSplit.parseMultiLines(lines);
  };
  it("should convert lines to csv lines", function () {
    const lines = ["a,b,c,d", "hello,world,csvtojson,abc", "1,2,3,4"];
    const res = func(lines);
    assert.equal(res.rowsCells.length, 3);
    assert.equal(res.partial, "");
  });

  it("should process line breaks", function () {
    const lines = ["a,b,c", '15",hello,"ab', 'cde"', '"b""b",cc,dd'];
    const res = func(lines);
    assert.equal(res.rowsCells.length, 3);
    assert.equal(res.rowsCells[1][0], '15"');
    assert.equal(res.rowsCells[1][2], "ab\ncde");
    assert.equal(res.rowsCells[2][0], 'b"b');
    assert.equal(res.partial, "");
  });

  it("should return partial if line not closed", function () {
    const lines = ["a,b,c", '15",hello,"ab', "d,e,f"];
    const res = func(lines);
    assert.equal(res.rowsCells.length, 1);
    assert.equal(res.partial, '15",hello,"ab\nd,e,f\n');
  });
});

describe("RowSplit.parse function", function () {
  const rowSplit = new RowSplit(new Converter());
  const func = (str: string): RowSplitResult => {
    return rowSplit.parse(str);
  };
  it("should split complete csv line", function () {
    const str = "hello,world,csvtojson,awesome";
    const res = func(str);
    assert.equal(res.cells.length, 4);
    assert.equal(res.closed, true);
  });

  it("should split incomplete csv line", function () {
    const str = 'hello,world,"csvtojson,awesome';
    const res = func(str);
    assert.equal(res.closed, false);
  });

  it("should allow multiple line", function () {
    const str = '"he"llo",world,"csvtojson,a"\nwesome"';
    const res = func(str);
    assert.equal(res.closed, true);
    assert.equal(res.cells[2], 'csvtojson,a"\nwesome');
  });
  it("should allow blank quotes", () => {
    const data = "a|^^|^b^";

    const rowSplit = new RowSplit(
      new Converter({
        delimiter: "|",
        quote: "^",
        noheader: true
      })
    );
    const res = rowSplit.parse(data);
    assert.equal(res.cells[1], "");
  });
  it("should allow blank quotes in quotes", () => {
    const data = 'a,"hello,this,"", test"';

    const rowSplit = new RowSplit(
      new Converter({
        noheader: true
      })
    );
    const res = rowSplit.parse(data);
    assert.equal(res.cells[1], 'hello,this,", test');
  });
  it("should smart detect if an initial quote is only part of value ", () => {
    const data = '"Weight" (kg),Error code,"Height" (m)';
    const rowSplit = new RowSplit(
      new Converter({
        noheader: true
      })
    );
    const res = rowSplit.parse(data);
    assert.equal(res.cells.length, 3);
    assert(res.closed);
    assert.equal(res.cells[0], '"Weight" (kg)');
    assert.equal(res.cells[1], "Error code");
    assert.equal(res.cells[2], '"Height" (m)');
  });
  it("should concatenate the input string with the end-of-line character when it exists", () => {
    // Arrange
    const conv = new Converter();
    const rowSplit = new RowSplit(conv);
    const line = "1,John,Doe";
    const expected = "1,John,Doe\n";
    const result = rowSplit.parseOpenLines(line);

    assert.strictEqual(result, expected);
  });
});
