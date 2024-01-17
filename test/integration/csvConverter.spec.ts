import { Converter } from "../../src/Converter";
import csv from "../../src";
import assert from "assert";
import fs from "fs";
import sinon, { SinonSandbox } from "sinon";
import path from "path";
const dataDir = path.resolve(path.dirname(__filename), "../");
const testData = dataDir + "/data/testData";

describe("CSV Converter", () => {
  let sandbox: SinonSandbox;
  afterEach(() => {
    sandbox.restore();
  });
  before(() => {
    sandbox = sinon.createSandbox();
  });

  it("should create new instance of csv", function () {
    const obj = new Converter();
    assert(obj);
  });

  it("should read from a stream", function (done) {
    const obj = new Converter();
    const stream = fs.createReadStream(testData);
    obj.then(function (obj) {
      assert.equal(obj.length, 2);
      done();
    });
    stream.pipe(obj);
  });

  it("should call onNext once a row is parsed.", function (done) {
    const obj = new Converter();
    const stream = fs.createReadStream(testData);
    let called = false;
    obj.subscribe(function (resultRow) {
      assert(resultRow);
      called = true;
    });
    obj.on("done", function () {
      assert(called);
      done();
    });
    stream.pipe(obj);
  });

  it("should emit end_parsed message once it is finished.", function (done) {
    const obj = new Converter();
    obj.then(function (result) {
      assert(result);
      assert(result.length === 2);
      assert(result[0].date);
      assert(result[0].employee);
      assert(result[0].employee.name);
      assert(result[0].employee.age);
      assert(result[0].employee.number);
      assert(result[0].employee.key.length === 2);
      assert(result[0].address.length === 2);
      done();
    });

    fs.createReadStream(testData).pipe(obj);
  });

  it("should handle traling comma gracefully", function (done) {
    const trailCommaData = dataDir + "/data/trailingComma";
    const stream = fs.createReadStream(trailCommaData);
    const obj = new Converter();
    obj.then(function (result) {
      assert(result);
      assert(result.length > 0);
      done();
    });
    stream.pipe(obj);
  });

  it("should handle comma in column which is surrounded by qoutes", function (done) {
    const testData = dataDir + "/data/dataWithComma";
    const rs = fs.createReadStream(testData);
    const obj = new Converter({
      quote: "#"
    });
    obj.then(function (result) {
      assert(result[0].col1 === '"Mini. Sectt');
      assert.equal(result[3].col2, "125001,fenvkdsf");
      done();
    });
    rs.pipe(obj);
  });

  it("should be able to convert a csv to column array data", function (done) {
    const columArrData = dataDir + "/data/columnArray";
    const rs = fs.createReadStream(columArrData);
    const result: Record<string, string[]> = {};
    const csvConverter = new Converter();
    csvConverter.then(function () {
      assert(result.TIMESTAMP.length === 5);
      done();
    });
    csvConverter.subscribe(function (resultRow, rowIndex) {
      for (const key in resultRow) {
        if (resultRow[key]) {
          if (!result[key] || !(result[key] instanceof Array)) {
            result[key] = [];
          }
          result[key][rowIndex] = resultRow[key];
        }
      }
    });
    rs.pipe(csvConverter);
  });

  it("should be able to convert csv string directly", function (done) {
    const testData = dataDir + "/data/testData";
    const data = fs.readFileSync(testData).toString();
    const csvConverter = new Converter();
    //end_parsed will be emitted once parsing finished
    csvConverter.then(function (jsonObj) {
      assert.equal(jsonObj.length, 2);
    });
    csvConverter.fromString(data).then(function (jsonObj) {
      assert(jsonObj.length === 2);
      done();
    });
  });

  it("should be able to convert csv string with error", function (done) {
    const testData = dataDir + "/data/dataWithUnclosedQuotes";
    const data = fs.readFileSync(testData).toString();
    const csvConverter = new Converter();
    csvConverter.fromString(data).then(undefined, function (err) {
      assert(err);
      assert.equal(err.err, "unclosed_quote");
      done();
    });
  });

  it("should be able to convert csv string without callback provided", function (done) {
    const testData = dataDir + "/data/testData";
    const data = fs.readFileSync(testData).toString();
    const csvConverter = new Converter();
    csvConverter.then(function (jsonObj) {
      assert(jsonObj.length === 2);
      done();
    });
    csvConverter.fromString(data);
  });

  it("should be able to handle columns with double quotes", function (done) {
    const testData = dataDir + "/data/dataWithQoutes";
    const data = fs.readFileSync(testData).toString();
    const csvConverter = new Converter();
    csvConverter.fromString(data).then(function (jsonObj) {
      assert(
        jsonObj[0].TIMESTAMP === '13954264"22',
        JSON.stringify(jsonObj[0].TIMESTAMP)
      );

      assert(
        jsonObj[1].TIMESTAMP === "abc, def, ccc",
        JSON.stringify(jsonObj[1].TIMESTAMP)
      );
      done();
    });
  });

  it("should be able to handle columns with two double quotes", function (done) {
    const testData = dataDir + "/data/twodoublequotes";
    const data = fs.readFileSync(testData).toString();
    const csvConverter = new Converter();
    csvConverter.fromString(data).then(function (jsonObj) {
      assert.equal(jsonObj[0].title, '"');
      assert.equal(jsonObj[0].data, "xyabcde");
      assert.equal(jsonObj[0].uuid, 'fejal"eifa');
      assert.equal(jsonObj[0].fieldA, 'bnej""falkfe');
      assert.equal(jsonObj[0].fieldB, '"eisjfes"');
      done();
    });
  });

  it("should handle empty csv file", function (done) {
    const testData = dataDir + "/data/emptyFile";
    const rs = fs.createReadStream(testData);
    const csvConverter = new Converter();
    csvConverter.then(function (jsonObj) {
      assert(jsonObj.length === 0);
      done();
    });
    rs.pipe(csvConverter);
  });

  it("should parse large csv file", function (done) {
    const testData = dataDir + "/data/large-csv-sample.csv";
    const rs = fs.createReadStream(testData);
    const csvConverter = new Converter();
    let count = 0;
    csvConverter.subscribe(function () {
      count++;
    });
    csvConverter.then(function () {
      assert(count === 5290);
      done();
    });
    rs.pipe(csvConverter);
  });

  it("should parse data and covert to specific types", function (done) {
    const testData = dataDir + "/data/dataWithType";
    const rs = fs.createReadStream(testData);
    const csvConverter = new Converter({
      checkType: true,
      colParser: {
        column6: "string",
        column7: "string"
      }
    });
    csvConverter.subscribe(function (d) {
      assert(typeof d.column1 === "number");
      assert(typeof d.column2 === "string");
      assert.equal(d["colume4"], "someinvaliddate");
      assert(d.column5.hello === "world");
      assert(d.column6 === '{"hello":"world"}');
      assert(d.column7 === "1234");
      assert(d.column8 === "abcd");
      assert(d.column9 === true);
      assert(d.column10[0] === 23);
      assert(d.column10[1] === 31);
      assert(d.column11[0].hello === "world");
      assert(d["name#!"] === false);
    });
    csvConverter.on("done", function () {
      done();
    });
    rs.pipe(csvConverter);
  });

  it("should turn off field type check", function (done) {
    const testData = dataDir + "/data/dataWithType";
    const rs = fs.createReadStream(testData);
    const csvConverter = new Converter({
      checkType: false
    });
    csvConverter.subscribe(function (d) {
      assert(typeof d.column1 === "string");
      assert(typeof d.column2 === "string");
      assert(d["column3"] === "2012-01-01");
      assert(d["colume4"] === "someinvaliddate");
      assert(d.column5 === '{"hello":"world"}');
      assert.equal(d["column6"], '{"hello":"world"}');
      assert(d["column7"] === "1234");
      assert(d["column8"] === "abcd");
      assert(d.column9 === "true");
      assert(d.column10[0] === "23");
      assert(d.column10[1] === "31");
      assert(d["name#!"] === "false");
    });
    csvConverter.then(function () {
      done();
    });
    rs.pipe(csvConverter);
  });

  it("should emit data event correctly", function (done) {
    const testData = dataDir + "/data/large-csv-sample.csv";

    const csvConverter = new Converter({});
    let count = 0;
    csvConverter.on("data", function () {
      count++;
    });
    csvConverter.on("end", function () {
      assert.equal(count, 5290);
      done();
    });
    const rs = fs.createReadStream(testData);
    rs.pipe(csvConverter);
  });

  it("should process column with linebreaks", function (done) {
    const testData = dataDir + "/data/lineBreak";
    const rs = fs.createReadStream(testData);
    const csvConverter = new Converter({
      checkType: true
    });
    csvConverter.subscribe(function (d) {
      assert(d.Period === 13);
      assert(d["Apparent age"] === "Unknown");
      done();
    });
    rs.pipe(csvConverter);
  });

  it("be able to ignore empty columns", function (done) {
    const testData = dataDir + "/data/dataIgnoreEmpty";
    const rs = fs.createReadStream(testData);
    const st = rs.pipe(csv({ ignoreEmpty: true }));
    st.then(function (res) {
      const j = res[0];
      assert(res.length === 3);
      assert(j.col2.length === 2);
      assert(j.col2[1] === "d3");
      assert(j.col4.col3 === undefined);
      assert(j.col4.col5 === "world");
      assert(res[1].col1 === "d2");
      assert(res[2].col1 === "d4");
      done();
    });
  });

  it("should allow no header", function (done) {
    const testData = dataDir + "/data/noheadercsv";
    const rs = fs.createReadStream(testData);
    const st = rs.pipe(new Converter({ noheader: true }));
    st.then(function (res) {
      const j = res[0];
      assert(res.length === 5);
      assert(j.field1 === "CC102-PDMI-001");
      assert(j.field2 === "eClass_5.1.3");
      done();
    });
  });

  it("should allow customised header", function (done) {
    const testData = dataDir + "/data/noheadercsv";
    const rs = fs.createReadStream(testData);
    const st = rs.pipe(
      new Converter({
        noheader: true,
        headers: ["a", "b"]
      })
    );
    st.then(function (res) {
      const j = res[0];
      assert(res.length === 5);
      assert(j.a === "CC102-PDMI-001");
      assert(j.b === "eClass_5.1.3");
      assert(j.field3 === "10/3/2014");
      done();
    });
  });

  it("should allow customised header to override existing header", function (done) {
    const testData = dataDir + "/data/complexJSONCSV";
    const rs = fs.createReadStream(testData);
    const st = rs.pipe(
      new Converter({
        headers: []
      })
    );
    st.then(function (res) {
      const j = res[0];
      assert(res.length === 2);
      assert(j.field1 === "Food Factory");
      assert(j.field2 === "Oscar");
      done();
    });
  });

  it("should handle when there is an empty string", function (done) {
    const testData = dataDir + "/data/dataWithEmptyString";
    const rs = fs.createReadStream(testData);
    const st = rs.pipe(
      new Converter({
        noheader: true,
        headers: ["a", "b", "c"],
        checkType: true
      })
    );
    st.then(function (res) {
      const j = res[0];
      assert(j.a === "green");
      assert(j.b === 40);
      assert.equal(j.c, "");
      done();
    });
  });

  it("should detect eol correctly when first chunk is smaller than header row length", function (done) {
    const testData = dataDir + "/data/dataNoTrimCRLF";
    const rs = fs.createReadStream(testData, { highWaterMark: 3 });

    const st = rs.pipe(
      new Converter({
        trim: false
      })
    );
    st.then((res) => {
      const j = res[0];
      assert(res.length === 2);
      assert(j.name === "joe");
      assert(j.age === "20");
      assert.equal(res[1].name, "sam");
      assert.equal(res[1].age, "30");
      done();
    });
  });

  it("should detect eol correctly when first chunk ends in middle of CRLF line break", function (done) {
    const testData = dataDir + "/data/dataNoTrimCRLF";
    const rs = fs.createReadStream(testData, { highWaterMark: 9 });

    const st = rs.pipe(
      new Converter({
        trim: false
      })
    );
    st.then((res) => {
      const j = res[0];
      assert(res.length === 2);
      assert(j.name === "joe");
      assert(j.age === "20");
      assert.equal(res[1].name, "sam");
      assert.equal(res[1].age, "30");
      done();
    });
  });

  it("should emit eol event when line ending is detected as CRLF", function (done) {
    const testData = dataDir + "/data/dataNoTrimCRLF";
    const rs = fs.createReadStream(testData);

    const st = rs.pipe(new Converter());
    const eolCallback = sandbox.spy(function (eol) {
      assert.equal(eol, "\r\n");
    });
    st.on("eol", eolCallback);
    st.then( () => {
      assert.equal(eolCallback.callCount, 1, "should emit eol event once");
      done();
    });

  });

  it("should emit eol event when line ending is detected as LF", function (done) {
    const testData = dataDir + "/data/columnArray";
    const rs = fs.createReadStream(testData);

    const st = rs.pipe(new Converter());
    const eolCallback = sandbox.spy(function (eol) {
      assert.equal(eol, "\n");
    });
    st.on("eol", eolCallback);
    st.then(() => {
      assert.equal(eolCallback.callCount, 1, "should emit eol event once");
      done();
    });
  });

  it("should remove the Byte Order Mark (BOM) from input", (done) => {
    const testData = dataDir + "/data/dataNoTrimBOM";
    const rs = fs.createReadStream(testData);
    const st = rs.pipe(
      new Converter({
        trim: false
      })
    );
    st.then((res) => {
      const j = res[0];
      assert(res.length === 2);
      assert(j.name === "joe");
      assert(j.age === "20");
      done();
    });
  });
});
