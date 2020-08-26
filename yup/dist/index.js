"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMethod = addMethod;
Object.defineProperty(exports, "mixed", {
  enumerable: true,
  get: function () {
    return _mixed.default;
  }
});
Object.defineProperty(exports, "bool", {
  enumerable: true,
  get: function () {
    return _boolean.default;
  }
});
Object.defineProperty(exports, "string", {
  enumerable: true,
  get: function () {
    return _string.default;
  }
});
Object.defineProperty(exports, "number", {
  enumerable: true,
  get: function () {
    return _number.default;
  }
});
Object.defineProperty(exports, "date", {
  enumerable: true,
  get: function () {
    return _date.default;
  }
});
Object.defineProperty(exports, "object", {
  enumerable: true,
  get: function () {
    return _object.default;
  }
});
Object.defineProperty(exports, "array", {
  enumerable: true,
  get: function () {
    return _array.default;
  }
});
Object.defineProperty(exports, "ValidationError", {
  enumerable: true,
  get: function () {
    return _ValidationError.default;
  }
});
Object.defineProperty(exports, "reach", {
  enumerable: true,
  get: function () {
    return _reach.default;
  }
});
Object.defineProperty(exports, "isSchema", {
  enumerable: true,
  get: function () {
    return _isSchema.default;
  }
});
Object.defineProperty(exports, "setLocale", {
  enumerable: true,
  get: function () {
    return _setLocale.default;
  }
});
exports.lazy = exports.ref = exports.boolean = void 0;

var _mixed = _interopRequireDefault(require("./mixed"));

var _boolean = _interopRequireDefault(require("./boolean"));

var _string = _interopRequireDefault(require("./string"));

var _number = _interopRequireDefault(require("./number"));

var _date = _interopRequireDefault(require("./date"));

var _object = _interopRequireDefault(require("./object"));

var _array = _interopRequireDefault(require("./array"));

var _Reference = _interopRequireDefault(require("./Reference"));

var _Lazy = _interopRequireDefault(require("./Lazy"));

var _ValidationError = _interopRequireDefault(require("./ValidationError"));

var _reach = _interopRequireDefault(require("./util/reach"));

var _isSchema = _interopRequireDefault(require("./util/isSchema"));

var _setLocale = _interopRequireDefault(require("./setLocale"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let boolean = _boolean.default;
exports.boolean = boolean;

let ref = (key, options) => new _Reference.default(key, options);

exports.ref = ref;

let lazy = fn => new _Lazy.default(fn);

exports.lazy = lazy;

function addMethod(schemaType, name, fn) {
  if (!schemaType || !(0, _isSchema.default)(schemaType.prototype)) throw new TypeError('You must provide a yup schema constructor function');
  if (typeof name !== 'string') throw new TypeError('A Method name must be provided');
  if (typeof fn !== 'function') throw new TypeError('Method function must be provided');
  schemaType.prototype[name] = fn;
}