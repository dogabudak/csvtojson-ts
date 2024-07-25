"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initParseRuntime = void 0;
function initParseRuntime(converter) {
    const params = converter.parseParam;
    const rtn = {
        needProcessIgnoreColumn: false,
        needProcessIncludeColumn: false,
        selectedColumns: undefined,
        ended: false,
        hasError: false,
        error: undefined,
        delimiter: converter.parseParam.delimiter,
        eol: converter.parseParam.eol,
        columnConv: [],
        headerType: [],
        headerTitle: [],
        headerFlag: [],
        headers: undefined,
        started: false,
        parsedLineNumber: 0,
        columnValueSetter: []
    };
    if (params.ignoreColumns) {
        rtn.needProcessIgnoreColumn = true;
    }
    if (params.includeColumns) {
        rtn.needProcessIncludeColumn = true;
    }
    return rtn;
}
exports.initParseRuntime = initParseRuntime;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VSdW50aW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1BhcnNlUnVudGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFrQ0EsU0FBZ0IsZ0JBQWdCLENBQUMsU0FBb0I7SUFDbkQsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztJQUNwQyxNQUFNLEdBQUcsR0FBaUI7UUFDeEIsdUJBQXVCLEVBQUUsS0FBSztRQUM5Qix3QkFBd0IsRUFBRSxLQUFLO1FBQy9CLGVBQWUsRUFBRSxTQUFTO1FBQzFCLEtBQUssRUFBRSxLQUFLO1FBQ1osUUFBUSxFQUFFLEtBQUs7UUFDZixLQUFLLEVBQUUsU0FBUztRQUNoQixTQUFTLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTO1FBQ3pDLEdBQUcsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUc7UUFDN0IsVUFBVSxFQUFFLEVBQUU7UUFDZCxVQUFVLEVBQUUsRUFBRTtRQUNkLFdBQVcsRUFBRSxFQUFFO1FBQ2YsVUFBVSxFQUFFLEVBQUU7UUFDZCxPQUFPLEVBQUUsU0FBUztRQUNsQixPQUFPLEVBQUUsS0FBSztRQUNkLGdCQUFnQixFQUFFLENBQUM7UUFDbkIsaUJBQWlCLEVBQUUsRUFBRTtLQUN0QixDQUFDO0lBQ0YsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFO1FBQ3hCLEdBQUcsQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7S0FDcEM7SUFDRCxJQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUU7UUFDekIsR0FBRyxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztLQUNyQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQTNCRCw0Q0EyQkMifQ==