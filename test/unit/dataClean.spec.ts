import {expect} from "chai";
import CSVError from "../../src/CSVError";
import {ParseRuntime} from "../../src/ParseRuntime";
import {cleanUtf8Split} from "../../src/dataClean";

describe('data celan tests',()=>{

    describe('cleanUtf8Split', () => {
        it('should return the input buffer if the last byte is not a continuation byte', () => {
            const chunk = Buffer.from([0x41, 0x42, 0x43]);
            const runtime = {} as ParseRuntime;
            const result = cleanUtf8Split(chunk, runtime);
            expect(result).to.deep.equal(chunk);
        });
        it('should return a buffer up to the last complete character if the last byte is a continuation byte', () => {
            const chunk = Buffer.from([0xC3, 0x28]);
            const runtime = {} as ParseRuntime;
            const result = cleanUtf8Split(chunk, runtime);
            expect(result).to.deep.equal(Buffer.from([0xC3]));
        });
        it('should return a buffer up to the last complete character if the last byte is the start of a multi-byte character', () => {
            const chunk = Buffer.from([0xE2, 0x82]);
            const runtime = {} as ParseRuntime;
            const result = cleanUtf8Split(chunk, runtime);
            expect(result).to.deep.equal(Buffer.from([0xE2]));
        });
        it('should return an empty buffer if the input buffer is empty', () => {
            const chunk = Buffer.from([]);
            const runtime = {} as ParseRuntime;
            const result = cleanUtf8Split(chunk, runtime);
            expect(result).to.deep.equal(Buffer.from([]));
        });
        it('should return an empty buffer if the input buffer contains only continuation bytes', () => {
            const chunk = Buffer.from([0x80, 0x80]);
            const runtime = {} as ParseRuntime;
            const result = cleanUtf8Split(chunk, runtime);
            expect(result).to.deep.equal(Buffer.from([]));
        });
        it('should return the input buffer if it contains only complete characters', () => {
            const chunk = Buffer.from([0x41, 0x42, 0x43]);
            const runtime = {} as ParseRuntime;
            const result = cleanUtf8Split(chunk, runtime);
            expect(result).to.deep.equal(chunk);
        });

    });

})
