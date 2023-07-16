"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Converter = require("./Converter.js");
const helper = function (param, options) {
  return new Converter.Converter(param, options);
};
helper["csv"] = helper;
helper["Converter"] = Converter.Converter;
exports.default = helper;
