import { Converter } from "./Converter";
const helper = function (param, options) {
    return new Converter(param, options);
};
helper["csv"] = helper;
helper["Converter"] = Converter;
export default helper;
//# sourceMappingURL=index.js.map