import {expect} from "chai";
import CSVError from "../../src/CSVError";
import {ParseRuntime} from "../../src/ParseRuntime";
import {cleanUtf8Split} from "../../src/dataClean";

describe('data clean tests',()=>{

    describe('cleanUtf8Split', () => {
        it('should return the input buffer if the last byte is not a continuation byte', () => {
            const chunk = Buffer.from([0x41, 0x42, 0x43]);
            const runtime = {} as ParseRuntime;
            const result = cleanUtf8Split(chunk, runtime);
            expect(result).to.deep.equal(chunk);
        });
        it('should return an empty buffer if the input buffer is empty', () => {
            const chunk = Buffer.from([]);
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
