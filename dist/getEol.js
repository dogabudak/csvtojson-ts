"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getEol = (data, param) => {
    if (!param.eol && data) {
        for (let i = 0, len = data.length; i < len; i++) {
            if (data[i] === "\r") {
                if (data[i + 1] === "\n") {
                    param.eol = "\r\n";
                    break;
                }
                else if (data[i + 1]) {
                    param.eol = "\r";
                    break;
                }
            }
            else if (data[i] === "\n") {
                param.eol = "\n";
                break;
            }
        }
    }
    return param.eol || "\n";
};
exports.default = getEol;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RW9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dldEVvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBWSxFQUFFLEtBQW1CLEVBQVUsRUFBRTtJQUMzRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUU7UUFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMvQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3BCLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7b0JBQ3hCLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO29CQUNuQixNQUFNO2lCQUNQO3FCQUFNLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDdEIsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7b0JBQ2pCLE1BQU07aUJBQ1A7YUFDRjtpQkFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQzNCLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixNQUFNO2FBQ1A7U0FDRjtLQUNGO0lBQ0QsT0FBTyxLQUFLLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQztBQUMzQixDQUFDLENBQUM7QUFFRixrQkFBZSxNQUFNLENBQUMifQ==