import { Converter } from "../../src/Converter";
import assert from "assert";
import {checkType, dynamicType, stringType} from "../../src/lineToJson";
describe("line to json functions",  ()=> {
    describe('checkType', () => {
        it('should return the function from headerType if it exists for the given index', () => {
            const conv: Converter = new Converter();
            conv.parseRuntime.headerType[0] = stringType;
            const item: string = "123";
            const head: string = "header";
            const headIdx: number = 0;
            const result = checkType(item, head, headIdx, conv);
            assert.strictEqual(result, stringType);
        });
    it('should return dynamicType if checkType is true and headerType is falsy', () => {
        const conv: Converter = new Converter();
        conv.parseParam.checkType = true;
        const item: string = "123";
        const head: string = "header";
        const headIdx: number = 0;
        const result = checkType(item, head, headIdx, conv);
        assert.strictEqual(result, dynamicType);
    });
    it('should return stringType if checkType is false and headerType is falsy', () => {
        const conv: Converter = new Converter();
        conv.parseParam.checkType = false;
        const item: string = "123";
        const head: string = "header";
        const headIdx: number = 0;
        const result = checkType(item, head, headIdx, conv);
        assert.strictEqual(result, stringType);
    });

});

});
