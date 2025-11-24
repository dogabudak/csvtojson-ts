import { expect } from "chai";
import sinon from "sinon";
import { Converter } from "../../src/Converter";
import { Processor, ProcessLineResult } from "../../src/Processor";
import { CSVParseParam } from "../../src/Parameters";
import { ParseRuntime } from "../../src/ParseRuntime";

class TestProcessor extends Processor {
  async process(chunk: Buffer, finalChunk?: boolean): Promise<ProcessLineResult[]> {
    return ["test,data"];
  }
  
  destroy(): void {
    // Test implementation
  }
  
  async flush(): Promise<ProcessLineResult[]> {
    return [];
  }
}

describe("Processor", () => {
  let converter: Converter;
  let processor: TestProcessor;

  beforeEach(() => {
    converter = new Converter();
    processor = new TestProcessor(converter);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("constructor", () => {
    it("should initialize with converter's parameters and runtime", () => {
      expect(processor["params"]).to.equal(converter.parseParam);
      expect(processor["runtime"]).to.equal(converter.parseRuntime);
      expect(processor["converter"]).to.equal(converter);
    });

    it("should have access to parse parameters", () => {
      const params = processor["params"];
      expect(params).to.be.an("object");
      expect(params).to.have.property("delimiter");
      expect(params).to.have.property("quote");
      expect(params).to.have.property("trim");
    });

    it("should have access to parse runtime", () => {
      const runtime = processor["runtime"];
      expect(runtime).to.be.an("object");
      expect(runtime).to.have.property("started");
      expect(runtime).to.have.property("ended");
      expect(runtime).to.have.property("hasError");
    });
  });

  describe("process method", () => {
    it("should be implemented by subclass", async () => {
      const testChunk = Buffer.from("test,data\n");
      const result = await processor.process(testChunk);
      
      expect(result).to.be.an("array");
      expect(result).to.have.length(1);
      expect(result[0]).to.equal("test,data");
    });

    it("should handle final chunk parameter", async () => {
      const testChunk = Buffer.from("test,data");
      const result = await processor.process(testChunk, true);
      
      expect(result).to.be.an("array");
    });
  });

  describe("flush method", () => {
    it("should be implemented by subclass", async () => {
      const result = await processor.flush();
      expect(result).to.be.an("array");
      expect(result).to.have.length(0);
    });
  });

  describe("destroy method", () => {
    it("should be implemented by subclass", () => {
      expect(() => processor.destroy()).to.not.throw();
    });
  });

  describe("inheritance", () => {
    it("should be abstract and require implementation of abstract methods", () => {
      expect(processor).to.be.instanceOf(Processor);
    });

    it("should allow access to protected members in subclass", () => {
      class ExtendedProcessor extends Processor {
        async process(chunk: Buffer): Promise<ProcessLineResult[]> {
          // Access protected members
          expect(this.params).to.equal(this.converter.parseParam);
          expect(this.runtime).to.equal(this.converter.parseRuntime);
          return [];
        }
        
        destroy(): void {}
        async flush(): Promise<ProcessLineResult[]> { return []; }
      }

      const extended = new ExtendedProcessor(converter);
      expect(extended).to.be.instanceOf(Processor);
    });
  });

  describe("ProcessLineResult type", () => {
    it("should accept string results", async () => {
      class StringProcessor extends Processor {
        async process(): Promise<ProcessLineResult[]> {
          return ["string result"];
        }
        destroy(): void {}
        async flush(): Promise<ProcessLineResult[]> { return []; }
      }

      const stringProc = new StringProcessor(converter);
      const result = await stringProc.process(Buffer.from("test"));
      expect(result[0]).to.be.a("string");
    });

    it("should accept string array results", async () => {
      class ArrayProcessor extends Processor {
        async process(): Promise<ProcessLineResult[]> {
          return [["field1", "field2", "field3"]];
        }
        destroy(): void {}
        async flush(): Promise<ProcessLineResult[]> { return []; }
      }

      const arrayProc = new ArrayProcessor(converter);
      const result = await arrayProc.process(Buffer.from("test"));
      expect(result[0]).to.be.an("array");
    });

    it("should accept JSONResult objects", async () => {
      class JSONProcessor extends Processor {
        async process(): Promise<ProcessLineResult[]> {
          return [{ name: "test", age: 25 }];
        }
        destroy(): void {}
        async flush(): Promise<ProcessLineResult[]> { return []; }
      }

      const jsonProc = new JSONProcessor(converter);
      const result = await jsonProc.process(Buffer.from("test"));
      expect(result[0]).to.be.an("object");
      expect(result[0]).to.have.property("name");
    });
  });

  describe("error handling", () => {
    it("should handle processor errors gracefully", async () => {
      class ErrorProcessor extends Processor {
        async process(): Promise<ProcessLineResult[]> {
          throw new Error("Processing failed");
        }
        destroy(): void {}
        async flush(): Promise<ProcessLineResult[]> { return []; }
      }

      const errorProc = new ErrorProcessor(converter);
      
      try {
        await errorProc.process(Buffer.from("test"));
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal("Processing failed");
      }
    });
  });
});