"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mixed = _interopRequireDefault(require("./mixed"));

var _inherits = _interopRequireDefault(require("./util/inherits"));

var _isodate = _interopRequireDefault(require("./util/isodate"));

var _locale = require("./locale");

var _isAbsent = _interopRequireDefault(require("./util/isAbsent"));

var _Reference = _interopRequireDefault(require("./Reference"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let invalidDate = new Date('');

let isDate = obj => Object.prototype.toString.call(obj) === '[object Date]';

var _default = DateSchema;
exports.default = _default;

function DateSchema() {
  if (!(this instanceof DateSchema)) return new DateSchema();

  _mixed.default.call(this, {
    type: 'date'
  });

  this.withMutation(() => {
    this.transform(function (value) {
      if (this.isType(value)) return value;
      value = (0, _isodate.default)(value); // 0 is a valid timestamp equivalent to 1970-01-01T00:00:00Z(unix epoch) or before.

      return !isNaN(value) ? new Date(value) : invalidDate;
    });
  });
}

(0, _inherits.default)(DateSchema, _mixed.default, {
  _typeCheck(v) {
    return isDate(v) && !isNaN(v.getTime());
  },

  min(min, message = _locale.date.min) {
    var limit = min;

    if (!_Reference.default.isRef(limit)) {
      limit = this.cast(min);
      if (!this._typeCheck(limit)) throw new TypeError('`min` must be a Date or a value that can be `cast()` to a Date');
    }

    return this.test({
      message,
      name: 'min',
      exclusive: true,
      params: {
        min
      },

      test(value) {
        return (0, _isAbsent.default)(value) || value >= this.resolve(limit);
      }

    });
  },

  max(max, message = _locale.date.max) {
    var limit = max;

    if (!_Reference.default.isRef(limit)) {
      limit = this.cast(max);
      if (!this._typeCheck(limit)) throw new TypeError('`max` must be a Date or a value that can be `cast()` to a Date');
    }

    return this.test({
      message,
      name: 'max',
      exclusive: true,
      params: {
        max
      },

      test(value) {
        return (0, _isAbsent.default)(value) || value <= this.resolve(limit);
      }

    });
  }

});