import { Converter } from "../../src/Converter";
import csv from "../../src";
import sinon, {SinonSandbox} from "sinon";
import assert from "assert";
import fs from "fs";
describe("testCSVConverter2", function () {
  let sandbox: SinonSandbox;
  afterEach(function () {
    sandbox.restore();
  });
  before(function () {
    sandbox = sinon.createSandbox();
  });

  it("should convert from large csv string", function (done) {
    const csvStr = fs.readFileSync(__dirname + "/data/large-csv-sample.csv", "utf8");
    const conv = new Converter({});
    conv.fromString(csvStr).then(function (res) {
      assert(res.length === 5290);
      done();
    });
  });

  it("should set eol", function (done) {
    const rs = fs.createReadStream(__dirname + "/data/large-csv-sample.csv");
    const conv = new Converter({
      eol: "\n"
    });
    let count = 0;
    conv.subscribe(function (resultJson, index) {
      count++;
      assert(resultJson);
      // assert(row.length === 2);
      assert(index >= 0);
    });
    conv.on("error", function () {
      console.log(arguments);
    });
    conv.then(function (result) {
      assert(result);
      assert(count === 5290);
      done();
    });
    rs.pipe(conv);
  });

  it("should convert tsv String", function (done) {
    const tsv = __dirname + "/data/dataTsv";
    const csvStr = fs.readFileSync(tsv, "utf8");
    const conv = new Converter({
      delimiter: "\t",
      checkType: false
    });
    conv.fromString(csvStr).then(function (res) {
      assert(res);
      assert.equal(res.length, 200);
      done();
    });
  });

  it("should allow customised header with nohead csv string.", function (done) {
    const testData = __dirname + "/data/noheadercsv";
    const rs = fs.readFileSync(testData, "utf8");
    const conv = new Converter({
      noheader: true,
      headers: ["a", "b", "c", "e", "f", "g"]
    });
    conv.fromString(rs).then(function (json) {
      assert.equal(json[0].field7, 40);
      assert.equal(json[0].a, "CC102-PDMI-001");
      done();
    });
  });

  it("should parse fromFile", function (done) {
    const csvFile = __dirname + "/data/large-csv-sample.csv";
    const conv = new Converter({});
    conv.fromFile(csvFile).then(function (res) {
      assert.equal(res.length, 5290);
      done();
    });
  });

  it("should parse fromFile with encoding option", function (done) {
    const csvFile = __dirname + "/data/dataWithLatin1Encoding";
    const conv = new Converter({});
    conv.fromFile(csvFile, { encoding: "latin1" }).then(function (json) {
      assert.equal(json[0].Name, "bébé");
      done();
    });
  });

  it("should fromFile should emit error", function (done) {
    const csvFile = __dirname + "/data/dataWithUnclosedQuotes";
    const conv = new Converter({});
    conv.fromFile(csvFile).then(
      function (res) {
        done();
      },
      function (err) {
        assert(err);
        done();
      }
    );
  });

  it("should parse no header with dynamic column number", function (done) {
    const testData = __dirname + "/data/noheaderWithVaryColumnNum";
    const rs = fs.readFileSync(testData, "utf8");
    const conv = new Converter({
      noheader: true
    });
    conv.fromString(rs).then(function (json) {
      assert.equal(json.length, 2);
      assert.equal(json[1].field4, 7);
      done();
    });
  });

  it("should parse tabsv data with dynamic columns", function (done) {
    const testData = __dirname + "/data/tabsv";
    const rs = fs.readFileSync(testData, "utf8");
    const conv = new Converter({
      delimiter: "\t"
    });
    conv.fromString(rs).then(function (json) {
      assert.equal(json[0].Idevise, "");
      done();
    });
  });

  it("should use first line break as eol", function (done) {
    const testData = __dirname + "/data/testEol";
    const conv = new Converter({
      noheader: true
    });
    conv.fromFile(testData).then(function (json) {
      assert(json);
      done();
    });
  });

  it("should detect delimiter", function (done) {
    const testData = __dirname + "/data/dataWithAutoDelimiter";
    const rs = fs.createReadStream(testData);
    const conv = new Converter({ delimiter: "auto" });
    conv.then(function (res) {
      assert.equal(res[0].col1, "Mini. Sectt:hisar S.O");
      assert.equal(res[1].col1, "#Mini. Sectt");
      done();
    });
    rs.pipe(conv);
  });

  it("should emit delimiter event", function (done) {
    const testData = __dirname + "/data/dataWithAutoDelimiter";
    const rs = fs.createReadStream(testData);
    const conv = new Converter({ delimiter: "auto" });
    const delimiterCallback = sandbox.spy(function (delimiter) {
      assert.equal(delimiter, ":");
    });
    conv.on("delimiter", delimiterCallback);
    conv.then(function () {
      assert.equal(delimiterCallback.callCount, 1);
      done();
    });
    rs.pipe(conv);
  });

  it("should emit delimiter event when no header", function (done) {
    const testData = __dirname + "/data/dataWithAutoDelimiter";
    const rs = fs.createReadStream(testData);
    const conv = new Converter({ delimiter: "auto", noheader: true });
    const delimiterCallback = sandbox.spy(function (delimiter) {
      assert.equal(delimiter, ":");
    });
    conv.on("delimiter", delimiterCallback);
    conv.then(function () {
      assert.equal(delimiterCallback.callCount, 1);
      done();
    });
    rs.pipe(conv);
  });
  it("should stripe out whitespaces if trim is true", function (done) {
    const testData = __dirname + "/data/dataWithWhiteSpace";
    const rs = fs.createReadStream(testData);
    const conv = new Converter({ trim: true });
    conv.then(function (res) {
      assert.equal(res[0]["Column 1"], "Column1Row1");
      assert.equal(res[0]["Column 2"], "Column2Row1");
      done();
    });
    rs.pipe(conv);
  });

  it("should convert triple quotes correctly", function (done) {
    const testData = __dirname + "/data/dataWithTripleQoutes";
    const rs = fs.createReadStream(testData);
    const conv = new Converter({ trim: true });
    conv.then(function (res) {
      assert.equal(res[0].Description, "ac, abs, moon");
      assert.equal(res[1].Model, 'Venture "Extended Edition"');
      assert.equal(res[2].Model, 'Venture "Extended Edition, Very Large"');
      done();
    });
    rs.pipe(conv);
  });

  it("should pre process raw data in the line", function (done) {
    const testData = __dirname + "/data/quoteTolerant";
    const rs = fs.createReadStream(testData);
    const conv = new Converter();
    conv.preRawData(function (d) {
      return d.replace("THICK", "THIN");
    });
    conv.then(function (res) {
      assert(res[0].Description.indexOf("THIN") > -1);
      done();
    });
    rs.pipe(conv);
  });

  it("should pre process by line in the line", function (done) {
    const testData = __dirname + "/data/quoteTolerant";
    const rs = fs.createReadStream(testData);
    const conv = new Converter();
    conv.preFileLine(function (line, lineNumber) {
      if (lineNumber === 1) {
        line = line.replace("THICK", "THIN");
      }
      return line;
    });

    conv.then(function (res) {
      assert(res[0].Description.indexOf("THIN") > -1);
      done();
    });
    rs.pipe(conv);
  });

  it("should support object mode", function (done) {
    const testData = __dirname + "/data/complexJSONCSV";
    const rs = fs.createReadStream(testData);
    const conv = new Converter(
      {},
      {
        objectMode: true
      }
    );
    conv.on("data", function (d) {
      assert(typeof d === "object");
    });
    conv.then(function (res) {
      assert(res);
      assert(res.length > 0);
      done();
    });
    rs.pipe(conv);
  });

  it("should get delimiter automatically if there is no header", function (done) {
    const test_converter = new Converter({
      delimiter: "auto",
      headers: ["col1", "col2"],
      noheader: true,
      checkColumn: true
    });

    const my_data = "first_val\tsecond_val";
    test_converter.fromString(my_data).then(function (result) {
      assert.equal(result.length, 1);
      assert.equal(result[0].col1, "first_val");
      assert.equal(result[0].col2, "second_val");
      done();
    });
  });

  it("should process escape chars", function (done) {
    const test_converter = new Converter({
      escape: "\\",
      checkType: true
    });

    const testData = __dirname + "/data/dataWithSlashEscape";
    const rs = fs.createReadStream(testData);
    test_converter.then(function (res) {
      assert.equal(res[0].raw.hello, "world");
      assert.equal(res[0].raw.test, true);
      done();
    });
    rs.pipe(test_converter);
  });

  it("should process escape chars when delimiter is between escaped quotes", function (done) {
    const test_converter = new Converter({
      escape: "\\"
    });

    const testData = __dirname + "/data/dataWithSlashEscapeAndDelimiterBetweenQuotes";
    const rs = fs.createReadStream(testData);
    test_converter.then(function (res) {
      assert.equal(res[0].raw, '"hello,"world"');
      done();
    });
    rs.pipe(test_converter);
  });

  it("should output ndjson format", function (done) {
    const conv = new Converter();
    conv
      .fromString("a,b,c\n1,2,3\n4,5,6")
      .on("data", function (d) {
        d = d.toString();
        assert.equal(d[d.length - 1], "\n");
      })
      .on("done", done);
  });

  it("should parse from stream", function (done) {
    const testData = __dirname + "/data/complexJSONCSV";
    const rs = fs.createReadStream(testData);
    csv()
      .fromStream(rs)
      .then(function (res) {
        assert(res);
        done();
      });
  });

  it("should set output as csv", function (done) {
    const testData = __dirname + "/data/complexJSONCSV";
    const rs = fs.createReadStream(testData);
    let numOfRow = 0;
    csv({ output: "csv" })
      .fromStream(rs)
      .subscribe(function (row, idx) {
        numOfRow++;
        assert(row);
        assert(idx >= 0);
      })

      .on("done", function (error) {
        assert(!error);
        assert.equal(2, numOfRow);
        assert(numOfRow !== 0);
        done();
      });
  });

  it("should transform with subscribe function", function (done) {
    const testData = __dirname + "/data/complexJSONCSV";
    const rs = fs.createReadStream(testData);
    csv()
      .fromStream(rs)
      .subscribe(function (json, idx) {
        json.a = "test";
        assert(idx >= 0);
      })
      .on("data", function (d) {
        const j = JSON.parse(d.toString());
        assert.equal(j.a, "test");
      })
      .on("end", function () {
        done();
      });
  });

  it("should parse a complex JSON", function (done) {
    const converter = new Converter({ checkType: true });
    const r = fs.createReadStream(__dirname + "/data/complexJSONCSV");
    converter.then(function (res) {
      assert(res);
      assert(res.length === 2);
      assert(res[0].fieldA.title === "Food Factory");
      assert(res[0].fieldA.children.length === 2);
      assert(res[0].fieldA.children[0].name === "Oscar");
      assert(res[0].fieldA.children[0].id === 23);
      assert(res[0].fieldA.children[1].name === "Tikka");
      assert.equal(res[0].fieldA.children[1].employee.length, 2);
      assert(
        res[0].fieldA.children[1].employee[0].name === "Tim",
        JSON.stringify(res[0].fieldA.children[1].employee[0])
      );
      assert(res[0].fieldA.address.length === 2);
      assert(res[0].fieldA.address[0] === "3 Lame Road");
      assert(res[0].fieldA.address[1] === "Grantstown");
      assert(res[0].description === "A fresh new food factory", res[0].description);
      done();
    });
    r.pipe(converter);
  });

  it("should allow flatKey to change parse behaviour", function (done) {
    const conv = new Converter({
      flatKeys: true
    });
    conv
      .fromString("a.b,b.d,c.a\n1,2,3\n4,5,6")
      .subscribe(function (d) {
        assert(d["a.b"]);
        assert(d["b.d"]);
        assert(d["c.a"]);
      })
      .on("done", done);
  });
  it("should allow flat mods to change parse behaviour", function (done) {
    const conv = new Converter({
      colParser: {
        "a.b": {
          flat: true
        }
      }
    });
    conv
      .fromString("a.b,b.d,c.a\n1,2,3\n4,5,6")
      .subscribe(function (d) {
        assert(d["a.b"]);
      })
      .on("done", done);
  });

  it("should process long header", function (done) {
    const testData = __dirname + "/data/longHeader";
    const rs = fs.createReadStream(testData, { highWaterMark: 100 });
    let numOfJson = 0;
    csv({}, { highWaterMark: 100 })
      .fromStream(rs)
      .subscribe(function (res, idx) {
        numOfJson++;
        assert.equal(res.Date, "8/26/16");
        assert(idx >= 0);
      })
      .on("done", function () {
        assert(numOfJson === 1);
        done();
      });
  });

  it("should parse #139", function (done) {
    const rs = fs.createReadStream(__dirname + "/data/data#139");
    csv()
      .fromStream(rs)
      .then(function (res) {
        assert.equal(res[1].field3, "9001009395 9001009990");
        done();
      });
  });

  it("should ignore column", function (done) {
    const rs = fs.createReadStream(__dirname + "/data/dataWithQoutes");
    let headerEmitted = false;
    csv({
      ignoreColumns: /TIMESTAMP/
    })
      .fromStream(rs)
      .on("header", function (header) {
        assert.equal(header.indexOf("TIMESTAMP"), -1);
        assert.equal(header.indexOf("UPDATE"), 0);
        if (headerEmitted) {
          throw "header event should only happen once";
        }
        headerEmitted = true;
      })
      .subscribe(function (j, idx) {
        assert(!j.TIMESTAMP);
        assert(idx >= 0);
      })
      .on("done", function () {
        assert(headerEmitted);
        done();
      });
  });
  it("should keep space around comma in csv", function () {
    const str = `"Name","Number"
    "John , space", 1234
    "Mr. , space", 4321
    `;
    return csv()
      .fromString(str)
      .then((data) => {
        assert.equal(data[0].Name, "John , space");
        assert.equal(data[1].Name, "Mr. , space");
      });
  });

  it("should include column", function (done) {
    const rs = fs.createReadStream(__dirname + "/data/dataWithQoutes");
    csv({
      includeColumns: /TIMESTAMP/
    })
      .fromStream(rs)
      .on("header", function (header) {
        assert.equal(header.indexOf("TIMESTAMP"), 0);
        assert.equal(header.indexOf("UPDATE"), -1);
        assert.equal(header.length, 1);
      })
      .subscribe(function (j, idx) {
        assert(idx >= 0);
        if (idx === 1) {
          assert.equal(j.TIMESTAMP, "abc, def, ccc");
        }
        assert(!j.UID);
        assert(!j["BYTES SENT"]);
      })
      .on("done", function () {
        done();
      });
  });

  it("should allow headers and include columns to be given as reference to the same const", function (done) {
    const rs = fs.createReadStream(__dirname + "/data/complexJSONCSV");
    const headers = ["first", "second", "third"];

    const expected = headers;

    csv({
      headers: headers,
      includeColumns: /(first|second|third)/
    })
      .fromStream(rs)
      .on("header", function (header) {
        expected.forEach(function (value, index) {
          assert.equal(header.indexOf(value), index);
        });
      })
      .subscribe(function (j, idx) {
        assert(idx >= 0);
        assert.equal(expected.length, Object.keys(j).length);
        expected.forEach(function (attribute) {
          assert(j.hasOwnProperty(attribute));
        });
      })
      .on("done", function () {
        done();
      });
  });

  it("should leave provided params objects unmutated", function () {
    const rs = fs.createReadStream(__dirname + "/data/complexJSONCSV");
    const includeColumns = ["fieldA.title", "description"];

    return csv({
      includeColumns: /(fieldA\.title|description)/
    })
      .fromStream(rs)
      .on("json", function (j, idx) {
        assert(idx >= 0);
      })
      .on("header", function (header) {
        includeColumns.forEach(function (value, index) {
          assert.equal(index, header.indexOf(value));
        });
      });
  });

  it("should only call done once", function (done) {
    let counter = 0;
    csv()
      .fromString('"a","b", "c""')
      .on("done", function () {
        counter++;
      });
    setTimeout(function () {
      assert.equal(counter, 1);
      done();
    }, 100);
  });
});
