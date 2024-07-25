"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeParams = void 0;
function mergeParams(params) {
    const defaultParam = {
        delimiter: ",",
        ignoreColumns: undefined,
        includeColumns: undefined,
        quote: '"',
        trim: true,
        checkType: false,
        ignoreEmpty: false,
        noheader: false,
        headers: undefined,
        flatKeys: false,
        maxRowLength: 0,
        checkColumn: false,
        escape: '"',
        colParser: {},
        eol: undefined,
        alwaysSplitAtEOL: false,
        output: "json",
        nullObject: false,
        downstreamFormat: "line"
    };
    if (!params) {
        params = {};
    }
    for (const key in params) {
        if (params[key]) {
            if (Array.isArray(params[key])) {
                defaultParam[key] = [].concat(params[key]);
            }
            else {
                defaultParam[key] = params[key];
            }
        }
    }
    return defaultParam;
}
exports.mergeParams = mergeParams;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyYW1ldGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9QYXJhbWV0ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXFDQSxTQUFnQixXQUFXLENBQUMsTUFBcUM7SUFDL0QsTUFBTSxZQUFZLEdBQXdCO1FBQ3hDLFNBQVMsRUFBRSxHQUFHO1FBQ2QsYUFBYSxFQUFFLFNBQVM7UUFDeEIsY0FBYyxFQUFFLFNBQVM7UUFDekIsS0FBSyxFQUFFLEdBQUc7UUFDVixJQUFJLEVBQUUsSUFBSTtRQUNWLFNBQVMsRUFBRSxLQUFLO1FBQ2hCLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFLFNBQVM7UUFDbEIsUUFBUSxFQUFFLEtBQUs7UUFDZixZQUFZLEVBQUUsQ0FBQztRQUNmLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLE1BQU0sRUFBRSxHQUFHO1FBQ1gsU0FBUyxFQUFFLEVBQUU7UUFDYixHQUFHLEVBQUUsU0FBUztRQUNkLGdCQUFnQixFQUFFLEtBQUs7UUFDdkIsTUFBTSxFQUFFLE1BQU07UUFDZCxVQUFVLEVBQUUsS0FBSztRQUNqQixnQkFBZ0IsRUFBRSxNQUFNO0tBQ3pCLENBQUM7SUFDRixJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1gsTUFBTSxHQUFHLEVBQUUsQ0FBQztLQUNiO0lBQ0QsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUU7UUFDeEIsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDZixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQzlCLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNMLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDakM7U0FDRjtLQUNGO0lBQ0QsT0FBTyxZQUE2QixDQUFDO0FBQ3ZDLENBQUM7QUFuQ0Qsa0NBbUNDIn0=