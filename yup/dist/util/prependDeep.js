"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prependDeep;

var _has = _interopRequireDefault(require("lodash/has"));

var _isSchema = _interopRequireDefault(require("./isSchema"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';

function prependDeep(target, source) {
  for (var key in source) if ((0, _has.default)(source, key)) {
    var sourceVal = source[key],
        targetVal = target[key];

    if (targetVal === undefined) {
      target[key] = sourceVal;
    } else if (targetVal === sourceVal) {
      continue;
    } else if ((0, _isSchema.default)(targetVal)) {
      if ((0, _isSchema.default)(sourceVal)) target[key] = sourceVal.concat(targetVal);
    } else if (isObject(targetVal)) {
      if (isObject(sourceVal)) target[key] = prependDeep(targetVal, sourceVal);
    } else if (Array.isArray(targetVal)) {
      if (Array.isArray(sourceVal)) target[key] = sourceVal.concat(targetVal);
    }
  }

  return target;
}