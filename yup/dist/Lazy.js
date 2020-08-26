"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _isSchema = _interopRequireDefault(require("./util/isSchema"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Lazy {
  constructor(mapFn) {
    this._resolve = (value, options) => {
      let schema = mapFn(value, options);
      if (!(0, _isSchema.default)(schema)) throw new TypeError('lazy() functions must return a valid schema');
      return schema.resolve(options);
    };
  }

  resolve(options) {
    return this._resolve(options.value, options);
  }

  cast(value, options) {
    return this._resolve(value, options).cast(value, options);
  }

  validate(value, options) {
    return this._resolve(value, options).validate(value, options);
  }

  validateSync(value, options) {
    return this._resolve(value, options).validateSync(value, options);
  }

  validateAt(path, value, options) {
    return this._resolve(value, options).validateAt(path, value, options);
  }

  validateSyncAt(path, value, options) {
    return this._resolve(value, options).validateSyncAt(path, value, options);
  }

}

Lazy.prototype.__isYupSchema__ = true;
var _default = Lazy;
exports.default = _default;