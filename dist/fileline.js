"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToLines = stringToLines;
const getEol_1 = __importDefault(require("./getEol"));
function stringToLines(data, param) {
    const eol = (0, getEol_1.default)(data, param);
    const lines = data.split(eol);
    const partial = lines.pop() || "";
    return { lines: lines, partial: partial };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZmlsZWxpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFHQSxzQ0FRQztBQVZELHNEQUE4QjtBQUU5QixTQUFnQixhQUFhLENBQzNCLElBQVksRUFDWixLQUFtQjtJQUVuQixNQUFNLEdBQUcsR0FBRyxJQUFBLGdCQUFNLEVBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNsQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDNUMsQ0FBQyJ9