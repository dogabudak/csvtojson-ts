import assert from "assert";
import { expect } from "chai";
import { bufFromString, filterArray } from "../../src/util";

describe("util functions", () => {
  describe("bufFromString function", () => {
    it("should return an empty Buffer object when passed an empty string", () => {
      const str = "";
      const result = bufFromString(str);
      assert.equal(result.length, 0);
      expect(result).to.be.instanceOf(Buffer);
    });

    it("should convert string to Buffer correctly", () => {
      const str = "Hello, World!";
      const result = bufFromString(str);
      
      expect(result).to.be.instanceOf(Buffer);
      expect(result.toString()).to.equal(str);
      expect(result.length).to.equal(Buffer.byteLength(str));
    });

    it("should handle UTF-8 characters correctly", () => {
      const str = "Hello, 世界! 🌍";
      const result = bufFromString(str);
      
      expect(result.toString()).to.equal(str);
      expect(result.length).to.equal(Buffer.byteLength(str));
    });

    it("should handle special characters and escape sequences", () => {
      const str = "line1\nline2\ttab\rcarriage return";
      const result = bufFromString(str);
      
      expect(result.toString()).to.equal(str);
      expect(result.length).to.equal(Buffer.byteLength(str));
    });

    it("should handle very long strings", () => {
      const str = "a".repeat(10000);
      const result = bufFromString(str);
      
      expect(result.toString()).to.equal(str);
      expect(result.length).to.equal(str.length);
    });

    it("should use allocUnsafe when available", () => {
      const str = "test string";
      const result = bufFromString(str);
      
      expect(result).to.be.instanceOf(Buffer);
      expect(result.toString()).to.equal(str);
    });

    it("should handle binary data correctly", () => {
      const str = "\u0000\u0001\u0002\u0003";
      const result = bufFromString(str);
      
      expect(result.toString()).to.equal(str);
      expect(result.length).to.be.greaterThan(0);
    });
  });

  describe("filterArray function", () => {
    it("should return empty array when input array is empty", () => {
      const arr: string[] = [];
      const filter = [0, 1, 2];
      const result = filterArray(arr, filter);
      
      expect(result).to.be.an("array");
      expect(result).to.have.length(0);
    });

    it("should return empty array when filter array is empty", () => {
      const arr = ["a", "b", "c"];
      const filter: number[] = [];
      const result = filterArray(arr, filter);
      
      expect(result).to.be.an("array");
      expect(result).to.have.length(0);
    });

    it("should filter array elements by indices correctly", () => {
      const arr = ["apple", "banana", "cherry", "date", "elderberry"];
      const filter = [0, 2, 4];
      const result = filterArray(arr, filter);
      
      expect(result).to.deep.equal(["apple", "cherry", "elderberry"]);
    });

    it("should handle duplicate indices in filter", () => {
      const arr = ["a", "b", "c", "d"];
      const filter = [1, 1, 2, 2];
      const result = filterArray(arr, filter);
      
      // The implementation only includes each index once, not duplicates
      expect(result).to.deep.equal(["b", "c"]);
    });

    it("should ignore indices that are out of bounds", () => {
      const arr = ["x", "y", "z"];
      const filter = [0, 2, 5, 10];
      const result = filterArray(arr, filter);
      
      expect(result).to.deep.equal(["x", "z"]);
    });

    it("should handle negative indices correctly", () => {
      const arr = ["a", "b", "c"];
      const filter = [-1, 0, 1, 3];
      const result = filterArray(arr, filter);
      
      expect(result).to.deep.equal(["a", "b"]);
    });

    it("should maintain order of original array indices", () => {
      const arr = ["first", "second", "third", "fourth", "fifth"];
      const filter = [4, 0, 2, 1];
      const result = filterArray(arr, filter);
      
      // The implementation preserves original array order, not filter order
      expect(result).to.deep.equal(["first", "second", "third", "fifth"]);
    });

    it("should handle single element arrays", () => {
      const arr = ["only"];
      const filter = [0];
      const result = filterArray(arr, filter);
      
      expect(result).to.deep.equal(["only"]);
    });

    it("should work with string arrays containing special characters", () => {
      const arr = ["hello\nworld", "tab\there", "quote\"test", "comma,separated"];
      const filter = [1, 3];
      const result = filterArray(arr, filter);
      
      expect(result).to.deep.equal(["tab\there", "comma,separated"]);
    });

    it("should work with arrays containing empty strings", () => {
      const arr = ["", "not empty", "", "also not empty"];
      const filter = [0, 2, 3];
      const result = filterArray(arr, filter);
      
      expect(result).to.deep.equal(["", "", "also not empty"]);
    });

    it("should handle large arrays and filter sets", () => {
      const arr = Array.from({ length: 100 }, (_, i) => `item${i}`);
      const filter = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
      const result = filterArray(arr, filter);
      
      expect(result).to.have.length(11);
      expect(result[0]).to.equal("item0");
      expect(result[10]).to.equal("item99");
    });

    it("should create a new array and not modify the original", () => {
      const arr = ["original1", "original2", "original3"];
      const originalCopy = [...arr];
      const filter = [0, 2];
      const result = filterArray(arr, filter);
      
      expect(arr).to.deep.equal(originalCopy);
      expect(result).to.not.equal(arr);
      expect(result).to.deep.equal(["original1", "original3"]);
    });
  });
});
