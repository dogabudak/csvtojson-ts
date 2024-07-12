"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CSVError extends Error {
    err;
    line;
    extra;
    static column_mismatched(index, extra) {
        return new CSVError("column_mismatched", index, extra);
    }
    static unclosed_quote(index, extra) {
        return new CSVError("unclosed_quote", index, extra);
    }
    static fromJSON(obj) {
        return new CSVError(obj.err, obj.line, obj.extra);
    }
    constructor(err, line, extra) {
        super("Error: " +
            err +
            ". JSON Line number: " +
            line +
            (extra ? " near: " + extra : ""));
        this.err = err;
        this.line = line;
        this.extra = extra;
        this.name = "CSV Parse Error";
    }
}
exports.default = CSVError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ1NWRXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvQ1NWRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFxQixRQUFTLFNBQVEsS0FBSztJQVV0QjtJQUFvQjtJQUFxQjtJQVQ1RCxNQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBYSxFQUFFLEtBQWM7UUFDcEQsT0FBTyxJQUFJLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNELE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBYSxFQUFFLEtBQWM7UUFDakQsT0FBTyxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBd0M7UUFDdEQsT0FBTyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFDRCxZQUFtQixHQUFXLEVBQVMsSUFBWSxFQUFTLEtBQWM7UUFDeEUsS0FBSyxDQUNILFNBQVM7WUFDUCxHQUFHO1lBQ0gsc0JBQXNCO1lBQ3RCLElBQUk7WUFDSixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQ25DLENBQUM7UUFQZSxRQUFHLEdBQUgsR0FBRyxDQUFRO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQVM7UUFReEUsSUFBSSxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztJQUNoQyxDQUFDO0NBQ0Y7QUFwQkQsMkJBb0JDIn0=