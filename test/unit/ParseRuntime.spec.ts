import { expect } from "chai";
import sinon from "sinon";
import { Converter } from "../../src/Converter";
import { ParseRuntime, initParseRuntime } from "../../src/ParseRuntime";
import { CSVParseParam } from "../../src/Parameters";
import CSVError from "../../src/CSVError";

describe("ParseRuntime", () => {
  let converter: Converter;

  beforeEach(() => {
    converter = new Converter();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("initParseRuntime", () => {
    it("should initialize ParseRuntime with default values", () => {
      const runtime = initParseRuntime(converter);

      expect(runtime).to.be.an("object");
      expect(runtime.needProcessIgnoreColumn).to.be.false;
      expect(runtime.needProcessIncludeColumn).to.be.false;
      expect(runtime.selectedColumns).to.be.undefined;
      expect(runtime.ended).to.be.false;
      expect(runtime.hasError).to.be.false;
      expect(runtime.error).to.be.undefined;
      expect(runtime.delimiter).to.equal(",");
      expect(runtime.eol).to.be.undefined;
      expect(runtime.columnConv).to.be.an("array").with.length(0);
      expect(runtime.headerType).to.be.an("array").with.length(0);
      expect(runtime.headerTitle).to.be.an("array").with.length(0);
      expect(runtime.headerFlag).to.be.an("array").with.length(0);
      expect(runtime.headers).to.be.undefined;
      expect(runtime.started).to.be.false;
      expect(runtime.parsedLineNumber).to.equal(0);
      expect(runtime.columnValueSetter).to.be.an("array").with.length(0);
    });

    it("should copy delimiter from converter parseParam", () => {
      const customConverter = new Converter({ delimiter: "|" });
      const runtime = initParseRuntime(customConverter);

      expect(runtime.delimiter).to.equal("|");
    });

    it("should copy eol from converter parseParam when provided", () => {
      const customConverter = new Converter({ eol: "\r\n" });
      const runtime = initParseRuntime(customConverter);

      expect(runtime.eol).to.equal("\r\n");
    });

    it("should set needProcessIgnoreColumn when ignoreColumns is provided", () => {
      const customConverter = new Converter({ ignoreColumns: /test/ });
      const runtime = initParseRuntime(customConverter);

      expect(runtime.needProcessIgnoreColumn).to.be.true;
    });

    it("should set needProcessIncludeColumn when includeColumns is provided", () => {
      const customConverter = new Converter({ includeColumns: /test/ });
      const runtime = initParseRuntime(customConverter);

      expect(runtime.needProcessIncludeColumn).to.be.true;
    });

    it("should set both flags when both ignoreColumns and includeColumns are provided", () => {
      const customConverter = new Converter({ 
        ignoreColumns: /ignore/, 
        includeColumns: /include/ 
      });
      const runtime = initParseRuntime(customConverter);

      expect(runtime.needProcessIgnoreColumn).to.be.true;
      expect(runtime.needProcessIncludeColumn).to.be.true;
    });
  });

  describe("ParseRuntime interface properties", () => {
    let runtime: ParseRuntime;

    beforeEach(() => {
      runtime = initParseRuntime(converter);
    });

    it("should allow setting selectedColumns", () => {
      runtime.selectedColumns = [0, 2, 4];
      expect(runtime.selectedColumns).to.deep.equal([0, 2, 4]);
    });

    it("should allow setting error state", () => {
      const testError = new Error("Test error");
      runtime.hasError = true;
      runtime.error = testError;

      expect(runtime.hasError).to.be.true;
      expect(runtime.error).to.equal(testError);
    });

    it("should allow setting csvLineBuffer", () => {
      const buffer = Buffer.from("test,data\n");
      runtime.csvLineBuffer = buffer;
      expect(runtime.csvLineBuffer).to.equal(buffer);
    });

    it("should allow setting preRawDataHook", () => {
      const hook = (csvString: string) => csvString.toUpperCase();
      runtime.preRawDataHook = hook;
      expect(runtime.preRawDataHook).to.equal(hook);
    });

    it("should allow setting preFileLineHook", () => {
      const hook = (line: string, lineNumber: number) => line.trim();
      runtime.preFileLineHook = hook;
      expect(runtime.preFileLineHook).to.equal(hook);
    });

    it("should allow setting subscribe callbacks", () => {
      const onNext = (data: any, lineNumber: number) => {};
      const onError = (err: CSVError) => {};
      const onCompleted = () => {};

      runtime.subscribe = { onNext, onError, onCompleted };

      expect(runtime.subscribe.onNext).to.equal(onNext);
      expect(runtime.subscribe.onError).to.equal(onError);
      expect(runtime.subscribe.onCompleted).to.equal(onCompleted);
    });

    it("should allow setting then callbacks", () => {
      const onfulfilled = (value: any[]) => value;
      const onrejected = (err: Error) => err;

      runtime.then = { onfulfilled, onrejected };

      expect(runtime.then.onfulfilled).to.equal(onfulfilled);
      expect(runtime.then.onrejected).to.equal(onrejected);
    });

    it("should allow modifying columnConv array", () => {
      const parser = (item: string) => parseInt(item);
      runtime.columnConv.push(parser);
      expect(runtime.columnConv).to.have.length(1);
      expect(runtime.columnConv[0]).to.equal(parser);
    });

    it("should allow modifying headerType array", () => {
      runtime.headerType.push("string", "number", "boolean");
      expect(runtime.headerType).to.have.length(3);
    });

    it("should allow modifying headerTitle array", () => {
      runtime.headerTitle.push("name", "age", "active");
      expect(runtime.headerTitle).to.have.length(3);
    });

    it("should allow modifying headerFlag array", () => {
      runtime.headerFlag.push(true, false, true);
      expect(runtime.headerFlag).to.have.length(3);
    });

    it("should allow setting headers array", () => {
      const headers = ["name", "age", "email"];
      runtime.headers = headers;
      expect(runtime.headers).to.equal(headers);
    });

    it("should allow incrementing parsedLineNumber", () => {
      runtime.parsedLineNumber++;
      runtime.parsedLineNumber++;
      expect(runtime.parsedLineNumber).to.equal(2);
    });

    it("should allow modifying columnValueSetter array", () => {
      const setter = (value: any) => value.toString();
      runtime.columnValueSetter.push(setter);
      expect(runtime.columnValueSetter).to.have.length(1);
      expect(runtime.columnValueSetter[0]).to.equal(setter);
    });
  });

  describe("runtime state management", () => {
    let runtime: ParseRuntime;

    beforeEach(() => {
      runtime = initParseRuntime(converter);
    });

    it("should track processing state correctly", () => {
      expect(runtime.started).to.be.false;
      expect(runtime.ended).to.be.false;

      runtime.started = true;
      expect(runtime.started).to.be.true;
      expect(runtime.ended).to.be.false;

      runtime.ended = true;
      expect(runtime.started).to.be.true;
      expect(runtime.ended).to.be.true;
    });

    it("should handle delimiter as string or array", () => {
      runtime.delimiter = "|";
      expect(runtime.delimiter).to.equal("|");

      runtime.delimiter = [",", ";", "\t"];
      expect(runtime.delimiter).to.deep.equal([",", ";", "\t"]);
    });

    it("should handle different eol formats", () => {
      runtime.eol = "\n";
      expect(runtime.eol).to.equal("\n");

      runtime.eol = "\r\n";
      expect(runtime.eol).to.equal("\r\n");

      runtime.eol = "\r";
      expect(runtime.eol).to.equal("\r");
    });
  });

  describe("integration with converter parameters", () => {
    it("should reflect converter parameter changes", () => {
      const customParams: Partial<CSVParseParam> = {
        delimiter: "\t",
        eol: "\r\n",
        ignoreColumns: /ignore_me/,
        includeColumns: /include_me/
      };

      const customConverter = new Converter(customParams);
      const runtime = initParseRuntime(customConverter);

      expect(runtime.delimiter).to.equal("\t");
      expect(runtime.eol).to.equal("\r\n");
      expect(runtime.needProcessIgnoreColumn).to.be.true;
      expect(runtime.needProcessIncludeColumn).to.be.true;
    });

    it("should handle array delimiter from converter", () => {
      const customConverter = new Converter({ delimiter: [",", ";"] });
      const runtime = initParseRuntime(customConverter);

      expect(runtime.delimiter).to.deep.equal([",", ";"]);
    });
  });
});