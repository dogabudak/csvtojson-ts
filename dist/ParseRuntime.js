export function initParseRuntime(converter) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VSdW50aW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1BhcnNlUnVudGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFrQ0EsTUFBTSxVQUFVLGdCQUFnQixDQUFDLFNBQW9CO0lBQ25ELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUM7SUFDcEMsTUFBTSxHQUFHLEdBQWlCO1FBQ3hCLHVCQUF1QixFQUFFLEtBQUs7UUFDOUIsd0JBQXdCLEVBQUUsS0FBSztRQUMvQixlQUFlLEVBQUUsU0FBUztRQUMxQixLQUFLLEVBQUUsS0FBSztRQUNaLFFBQVEsRUFBRSxLQUFLO1FBQ2YsS0FBSyxFQUFFLFNBQVM7UUFDaEIsU0FBUyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsU0FBUztRQUN6QyxHQUFHLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHO1FBQzdCLFVBQVUsRUFBRSxFQUFFO1FBQ2QsVUFBVSxFQUFFLEVBQUU7UUFDZCxXQUFXLEVBQUUsRUFBRTtRQUNmLFVBQVUsRUFBRSxFQUFFO1FBQ2QsT0FBTyxFQUFFLFNBQVM7UUFDbEIsT0FBTyxFQUFFLEtBQUs7UUFDZCxnQkFBZ0IsRUFBRSxDQUFDO1FBQ25CLGlCQUFpQixFQUFFLEVBQUU7S0FDdEIsQ0FBQztJQUNGLElBQUksTUFBTSxDQUFDLGFBQWEsRUFBRTtRQUN4QixHQUFHLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO0tBQ3BDO0lBQ0QsSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFO1FBQ3pCLEdBQUcsQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7S0FDckM7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMifQ==