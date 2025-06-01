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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RW9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dldEVvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBWSxFQUFFLEtBQW1CLEVBQVUsRUFBRTtJQUMzRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDekIsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7b0JBQ25CLE1BQU07Z0JBQ1IsQ0FBQztxQkFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDdkIsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7b0JBQ2pCLE1BQU07Z0JBQ1IsQ0FBQztZQUNILENBQUM7aUJBQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzVCLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixNQUFNO1lBQ1IsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQztBQUMzQixDQUFDLENBQUM7QUFFRixrQkFBZSxNQUFNLENBQUMifQ==