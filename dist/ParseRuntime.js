"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initParseRuntime = initParseRuntime;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VSdW50aW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1BhcnNlUnVudGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWtDQSw0Q0EyQkM7QUEzQkQsU0FBZ0IsZ0JBQWdCLENBQUMsU0FBb0I7SUFDbkQsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztJQUNwQyxNQUFNLEdBQUcsR0FBaUI7UUFDeEIsdUJBQXVCLEVBQUUsS0FBSztRQUM5Qix3QkFBd0IsRUFBRSxLQUFLO1FBQy9CLGVBQWUsRUFBRSxTQUFTO1FBQzFCLEtBQUssRUFBRSxLQUFLO1FBQ1osUUFBUSxFQUFFLEtBQUs7UUFDZixLQUFLLEVBQUUsU0FBUztRQUNoQixTQUFTLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTO1FBQ3pDLEdBQUcsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUc7UUFDN0IsVUFBVSxFQUFFLEVBQUU7UUFDZCxVQUFVLEVBQUUsRUFBRTtRQUNkLFdBQVcsRUFBRSxFQUFFO1FBQ2YsVUFBVSxFQUFFLEVBQUU7UUFDZCxPQUFPLEVBQUUsU0FBUztRQUNsQixPQUFPLEVBQUUsS0FBSztRQUNkLGdCQUFnQixFQUFFLENBQUM7UUFDbkIsaUJBQWlCLEVBQUUsRUFBRTtLQUN0QixDQUFDO0lBQ0YsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsR0FBRyxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQztJQUNyQyxDQUFDO0lBQ0QsSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDMUIsR0FBRyxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztJQUN0QyxDQUFDO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDIn0=