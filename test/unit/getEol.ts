import assert from "assert";
import {ParseRuntime} from "../../src/ParseRuntime";
import getEol from "../../src/getEol";
describe('getEol', () => {
    it('should return n if param.eol is already defined and data is empty', () => {
        const data = '';
        const param: ParseRuntime = {
            needProcessIgnoreColumn: false,
            needProcessIncludeColumn: false,
            ended: false,
            hasError: false,
            delimiter: '',
            columnConv: [],
            headerType: [],
            headerTitle: [],
            headerFlag: [],
            started: false,
            parsedLineNumber: 0,
            columnValueSetter: []
        };
        param.eol = '\r\n';
        const result = getEol(data, param);
        assert.strictEqual(result, '\n');
    });
    it('should return n if param.eol is already defined and data is not empty', () => {
        const data = 'some data';
        const param: ParseRuntime = {
            needProcessIgnoreColumn: false,
            needProcessIncludeColumn: false,
            ended: false,
            hasError: false,
            delimiter: '',
            columnConv: [],
            headerType: [],
            headerTitle: [],
            headerFlag: [],
            started: false,
            parsedLineNumber: 0,
            columnValueSetter: []
        };
        param.eol = '\r\n';
        const result = getEol(data, param);
        assert.strictEqual(result, '\n');
    });
    it('should return n if data is empty and param.eol is undefined', () => {
        const data = '';
        const param: ParseRuntime = {
            needProcessIgnoreColumn: false,
            needProcessIncludeColumn: false,
            ended: false,
            hasError: false,
            delimiter: '',
            columnConv: [],
            headerType: [],
            headerTitle: [],
            headerFlag: [],
            started: false,
            parsedLineNumber: 0,
            columnValueSetter: []
        };
        const result = getEol(data, param);
        assert.strictEqual(result, '\n');
    });
    it('should return n if data contains only r and param.eol is undefined', () => {
        // Arrange
        const data = '\r';
        const param: ParseRuntime = {
            needProcessIgnoreColumn: false,
            needProcessIncludeColumn: false,
            ended: false,
            hasError: false,
            delimiter: '',
            columnConv: [],
            headerType: [],
            headerTitle: [],
            headerFlag: [],
            started: false,
            parsedLineNumber: 0,
            columnValueSetter: []
        };
        const result = getEol(data, param);
        assert.strictEqual(result, '\n');
    });
    it('should return n if data contains only n and param.eol is undefined', () => {
        const data = '\n';
        const param: ParseRuntime = {
            needProcessIgnoreColumn: false,
            needProcessIncludeColumn: false,
            ended: false,
            hasError: false,
            delimiter: '',
            columnConv: [],
            headerType: [],
            headerTitle: [],
            headerFlag: [],
            started: false,
            parsedLineNumber: 0,
            columnValueSetter: []
        };
        const result = getEol(data, param);
        assert.strictEqual(result, '\n');
    });
    it('should return r if data contains r followed by non n characters and param.eol is undefined', () => {
        const data = '\rX';
        const param: ParseRuntime = {
            needProcessIgnoreColumn: false,
            needProcessIncludeColumn: false,
            ended: false,
            hasError: false,
            delimiter: '',
            columnConv: [],
            headerType: [],
            headerTitle: [],
            headerFlag: [],
            started: false,
            parsedLineNumber: 0,
            columnValueSetter: []
        };
        const result = getEol(data, param);
        assert.strictEqual(result, '\r');
    });
});
