import {Converter} from "../../src";
import assert from "assert";
import sinon, { SinonSandbox } from "sinon";
import fs from "fs";
import CSVError from "../../src/CSVError";
import path from "path";

const dir = path.resolve(path.dirname(__filename), "../");

describe("testCSVConverter3", function () {
  let sandbox: SinonSandbox;
  afterEach(function () {
    sandbox.restore();
  });
  before(function () {
    sandbox = sinon.createSandbox();
  });

  it("should parse large csv file with UTF-8 without spliting characters", function (done) {
    const testData = dir + "/data/large-utf8.csv";
    const rs = fs.createReadStream(testData);
    const csvConverter = new Converter({});
    let count = 0;
    csvConverter.preRawData(function (csvRawData) {
      assert(csvRawData.charCodeAt(0) < 2000);
      return csvRawData;
    });
    csvConverter.on("data", function () {
      count++;
    });
    csvConverter.then(function () {
      assert(count === 5290);
      done();
    });
    rs.pipe(csvConverter);
  });
  it("should setup customise type convert function", function (done) {
    new Converter({
      checkType: true,
      colParser: {
        column1: "string",
        column5: function (item, head, resultRow, row, i) {
          assert.equal(item, '{"hello":"world"}');
          assert.equal(head, "column5"), assert(resultRow);
          assert(row);
          assert.equal(i, 5);
          return "hello world";
        }
      }
    })
      .fromFile(dir + "/data/dataWithType")
      .subscribe(function (json) {
        assert.equal(typeof json.column1, "string");
        assert.equal(json.column5, "hello world");
        assert.strictEqual(json["name#!"], false);
        assert.strictEqual(json["column9"], true);
      })
      .on("done", function () {
        done();
      });
  });
  it("should accept pipe as quote", function (done) {
    new Converter({
      quote: "|",
      output: "csv"
    })
      .fromFile(dir + "/data/pipeAsQuote")
      .subscribe(function (csv) {
        assert.equal(csv[2], "blahhh, blah");
      })
      .on("done", function () {
        done();
      });
  });
  it("emit file not exists error when try to open a non-exists file", function () {
    const cb = sandbox.spy((err: () => void) => {
      assert(err.toString().indexOf("File does not exist") > -1);
    });
    return new Converter()
      .fromFile("somefile")
      .on("error", cb)
      .then(
        () => {
          assert(false);
        },
        () => {
          assert.equal(cb.callCount, 1);
        }
      );
  });
  it("should include column that is both included and excluded", () => {
    return new Converter({
      includeColumns: /b/,
      ignoreColumns: /a|b/
    })
      .fromString(
        `a,b,c
1,2,3
4,5,6`
      )
      .subscribe((d) => {
        assert(d.b);
        assert(!d.a);
      });
  });
  it("should allow async preLine hook", () => {
    return new Converter()
      .preFileLine((line) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(line + "changed");
          }, 20);
        });
      })
      .fromString(
        `a,b
1,2`
      )
      .subscribe((d) => {
        assert(d.bchanged);
        assert.equal(d.bchanged, "2changed");
      });
  });

  it("should allow async subscribe function", () => {
    return new Converter({ trim: true })
      .fromString(
        `a,b,c
    1,2,3
    4,5,6`
      )
      .subscribe((d) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            d.a = 10;
            resolve();
          }, 20);
        });
      })
      .then((d) => {
        assert.equal(d[0].a, 10);
        assert.equal(d[1].a, 10);
      });
  });
  it("should propagate value to next then", () => {
    return new Converter({ trim: true })
      .fromString(
        `a,b,c
  1,2,3
  4,5,6`
      )
      .then(undefined, undefined)
      .then((d) => {
        assert.equal(d.length, 2);
        assert.equal(d[0].a, "1");
      });
  });
  it("should propagate error to next then", () => {
    return new Converter({ trim: true })
      .fromFile(dir + "/data/dataWithUnclosedQuotes")
      .then(undefined, undefined)
      .then(
        () => {
          assert(false);
        },
        (err: CSVError) => {
          assert(err);
          assert.equal(err.err, "unclosed_quote");
        }
      );
  });
  it("should fallback to text is number can not be parsed", () => {
    return new Converter({
      colParser: {
        a: "number"
      }
    })
      .fromString(
        `a,b,c
  1,2,3
  fefe,5,6`
      )
      .then((d) => {
        assert.strictEqual(d[0].a, 1);
        assert.equal(d[1].a, "fefe");
      });
  });
  it("should omit a column", async () => {
    const d = await new Converter({
      colParser: {
        a: "omit"
      }
    }).fromString(
      `a,b,c
  1,2,3
  fefe,5,6`
    );
    assert.strictEqual(d[0].a, undefined);
    assert.equal(d[1].a, undefined);
  });
  it("could turn off quote and should trim even quote is turned off", () => {
    return new Converter({
      quote: "off",
      trim: true
    })
      .fromString(
        `a,b,c
  "1","2","3"
  "fefe,5",6`
      )
      .then((d) => {
        assert.equal(d[0].a, '"1"');
        assert.equal(d[0].b, '"2"');
        assert.equal(d[1].a, '"fefe');
        assert.equal(d[1].b, '5"');
      });
  });
  it("should allow ignoreEmpty with checkColumn", async () => {
    const result = await new Converter({
      checkColumn: true,
      ignoreEmpty: true
    }).fromString(
      `date,altitude,airtime
    2016-07-08,2000,23
    
    2016-07-09,3000,43`
    );
    assert.equal(result[0].date, "2016-07-08");
    assert.equal(result[1].date, "2016-07-09");
  });
  it("should allow quotes without content", () => {
    const data = "a|^^|^b^";
    return new Converter({
      delimiter: "|",
      quote: "^",
      noheader: true
    })
      .fromString(data)
      .then((jsonObj) => {
        assert.equal(jsonObj[0].field2, "");
      });
  });
  it("should parse header with quotes correctly", function () {
    const testData = dir + "/data/csvWithUnclosedHeader";
    return new Converter({
      headers: [
        "exam_date",
        "sample_no",
        "status",
        "sample_type",
        "patient_id",
        "last_name",
        "first_name",
        "gender_of_patient",
        "patient_birth_date",
        "patient_note",
        "patient_department",
        "accession_number",
        "sample_site",
        "physician",
        "operator",
        "department",
        "note",
        "test_order_code",
        "draw_time",
        "approval_status",
        "approval_time",
        "report_layout",
        "patient_account_number",
        "none_1",
        "errors_detected_during_measurement",
        "age",
        "error_code_01",
        "weight",
        "error_code_02",
        "height",
        "error_code_03",
        "hcg_beta_p",
        "error_code_04",
        "troponin_i_p",
        "error_code_05",
        "ck_mb_p",
        "error_code_06",
        "d_dimer_p",
        "error_code_07",
        "hscrp_p",
        "error_code_08",
        "myoglobin_p",
        "error_code_09",
        "nt_probnp",
        "error_code_10",
        "crp",
        "error_code_11",
        "bnp",
        "error_code_12",
        "tnt",
        "error_code_13",
        "demo_p",
        "error_code_14",
        "pct",
        "error_code_15"
      ]
    })
      .fromFile(testData)
      .then((d) => {
        assert.equal(d.length, 2);
        assert.equal(d[0].sample_no, "12669");
      });
  });
  it("should stream json string correctly", function (done) {
    const data = `a,b,c
1,2,3
4,5,6`;
    let hasLeftBracket = false;
    let hasRightBracket = false;
    new Converter({
      downstreamFormat: "array"
    })
      .fromString(data)
      .on("data", (d) => {
        const str = d.toString();
        if (str[0] === "[" && str.length === 2) {
          hasLeftBracket = true;
        } else if (str[0] === "]" && str.length === 2) {
          hasRightBracket = true;
        } else {
          assert.equal(str[str.length - 2], ",");
        }
      })
      .on("end", () => {
        assert.equal(hasLeftBracket, true);
        assert.equal(hasRightBracket, true);
        done();
      });
  });
  it("should stream json line correctly", function (done) {
    const data = `a,b,c
1,2,3
4,5,6`;
    new Converter({
      downstreamFormat: "line"
    })
      .fromString(data)
      .on("data", (d) => {
        const str = d.toString();

        assert.notEqual(str[str.length - 2], ",");
      })
      .on("end", () => {
        done();
      });
  });

  it("should convert null to null object", async function () {
    const data = `a,b,c
null,2,3
4,5,6`;
    return new Converter({
      nullObject: true
    })
      .fromString(data)
      .then((d) => {
        assert.equal(d[0].a, null);
      });
  });
  it("should process period properly", async function () {
    const data = `a..,b,c
1,2,3
4,5,6`;
    return new Converter({})
      .fromString(data)
      .then((d) => {
        assert.equal(d[0]["a.."], 1);
        assert.equal(d[1]["a.."], 4);
      });
  });
});
