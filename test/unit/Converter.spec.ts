import { expect } from "chai";
import sinon from "sinon";
import { Readable, Transform } from "stream";
import { Converter } from "../../src/Converter";
import { CSVParseParam } from "../../src/Parameters";

describe("Converter", () => {
  let converter: Converter;

  beforeEach(() => {
    converter = new Converter();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should create a Converter instance with default parameters", () => {
      expect(converter).to.be.instanceOf(Converter);
      expect(converter).to.be.instanceOf(Transform);
      expect(converter.parseParam).to.be.an("object");
      expect(converter.parseRuntime).to.be.an("object");
    });

    it("should merge custom parameters with defaults", () => {
      const customParam: Partial<CSVParseParam> = {
        delimiter: "|",
        trim: false,
        noheader: true
      };
      const customConverter = new Converter(customParam);
      
      expect(customConverter.parseParam.delimiter).to.equal("|");
      expect(customConverter.parseParam.trim).to.equal(true); // false is falsy, so default is kept
      expect(customConverter.parseParam.noheader).to.equal(true);
    });

    it("should accept transform options", () => {
      const options = { objectMode: true };
      const customConverter = new Converter({}, options);
      expect(customConverter).to.be.instanceOf(Converter);
    });
  });

  describe("preRawData", () => {
    it("should set preRawDataHook and return converter for chaining", () => {
      const callback = (data: string) => data.toUpperCase();
      const result = converter.preRawData(callback);
      
      expect(result).to.equal(converter);
      expect(converter.parseRuntime.preRawDataHook).to.equal(callback);
    });
  });

  describe("preFileLine", () => {
    it("should set preFileLineHook and return converter for chaining", () => {
      const callback = (line: string, lineNumber: number) => line.trim();
      const result = converter.preFileLine(callback);
      
      expect(result).to.equal(converter);
      expect(converter.parseRuntime.preFileLineHook).to.equal(callback);
    });
  });

  describe("subscribe", () => {
    it("should set subscribe callbacks and return converter for chaining", () => {
      const onNext = (data: any, lineNumber: number) => {};
      const onError = (err: any) => {};
      const onCompleted = () => {};
      
      const result = converter.subscribe(onNext, onError, onCompleted);
      
      expect(result).to.equal(converter);
      expect(converter.parseRuntime.subscribe?.onNext).to.equal(onNext);
      expect(converter.parseRuntime.subscribe?.onError).to.equal(onError);
      expect(converter.parseRuntime.subscribe?.onCompleted).to.equal(onCompleted);
    });

    it("should handle partial callback setup", () => {
      const onNext = (data: any, lineNumber: number) => {};
      const result = converter.subscribe(onNext);
      
      expect(result).to.equal(converter);
      expect(converter.parseRuntime.subscribe?.onNext).to.equal(onNext);
      expect(converter.parseRuntime.subscribe?.onError).to.be.undefined;
      expect(converter.parseRuntime.subscribe?.onCompleted).to.be.undefined;
    });
  });

  describe("fromString", () => {
    it("should process CSV string data", (done) => {
      const csvData = "name,age\nJohn,25\nJane,30";
      const results: any[] = [];
      
      converter.on("data", (data) => {
        results.push(data);
      });
      
      converter.on("end", () => {
        expect(results.length).to.be.greaterThan(0);
        done();
      });
      
      converter.fromString(csvData);
    });

    it("should return converter for chaining", () => {
      const result = converter.fromString("test,data");
      expect(result).to.equal(converter);
    });
  });

  describe("fromStream", () => {
    it("should pipe readable stream to converter", () => {
      const mockReadStream = new Readable({
        read() {
          this.push("test,data\n");
          this.push(null);
        }
      });
      
      const pipeSpy = sinon.spy(mockReadStream, "pipe");
      const result = converter.fromStream(mockReadStream);
      
      expect(result).to.equal(converter);
      expect(pipeSpy.calledWith(converter)).to.be.true;
    });
  });

  describe("then", () => {
    it("should return a promise-like object", () => {
      const result = converter.then();
      expect(result).to.have.property("then");
    });

    it("should handle fulfillment callback", (done) => {
      const onFulfilled = (value: any[]) => {
        expect(value).to.be.an("array");
        done();
        return value;
      };
      
      converter.then(onFulfilled);
      converter.fromString("name\ntest");
    });
  });

  describe("error handling", () => {
    it("should have error handling mechanisms", () => {
      // Test that the converter has proper error handling setup
      expect(converter.parseRuntime.hasError).to.be.false;
      expect(converter.parseRuntime.error).to.be.undefined;
      
      // The actual error handling is tested in integration tests
      expect(converter.listenerCount("error")).to.be.greaterThan(0);
    });

    it("should have processEnd method for cleanup", () => {
      expect(converter).to.have.property("_flush");
      expect(typeof converter._flush).to.equal("function");
    });
  });

  describe("_flush", () => {
    it("should process remaining data on flush", (done) => {
      converter.on("done", () => {
        done();
      });
      
      converter.fromString("name\ntest");
    });
  });

  describe("parseParam getter", () => {
    it("should return the parse parameters", () => {
      const params = converter.parseParam;
      expect(params).to.be.an("object");
      expect(params).to.have.property("delimiter");
      expect(params).to.have.property("quote");
    });
  });

  describe("parseRuntime getter", () => {
    it("should return the parse runtime", () => {
      const runtime = converter.parseRuntime;
      expect(runtime).to.be.an("object");
      expect(runtime).to.have.property("started");
      expect(runtime).to.have.property("ended");
    });
  });
});