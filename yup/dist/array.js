"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _inherits = _interopRequireDefault(require("./util/inherits"));

var _isAbsent = _interopRequireDefault(require("./util/isAbsent"));

var _isSchema = _interopRequireDefault(require("./util/isSchema"));

var _makePath = _interopRequireDefault(require("./util/makePath"));

var _printValue = _interopRequireDefault(require("./util/printValue"));

var _mixed = _interopRequireDefault(require("./mixed"));

var _locale = require("./locale");

var _runValidations = _interopRequireWildcard(require("./util/runValidations"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = ArraySchema;
exports.default = _default;

function ArraySchema(type) {
  if (!(this instanceof ArraySchema)) return new ArraySchema(type);

  _mixed.default.call(this, {
    type: 'array'
  }); // `undefined` specifically means uninitialized, as opposed to
  // "no subtype"


  this._subType = undefined;
  this.innerType = undefined;
  this.withMutation(() => {
    this.transform(function (values) {
      if (typeof values === 'string') try {
        values = JSON.parse(values);
      } catch (err) {
        values = null;
      }
      return this.isType(values) ? values : null;
    });
    if (type) this.of(type);
  });
}

(0, _inherits.default)(ArraySchema, _mixed.default, {
  _typeCheck(v) {
    return Array.isArray(v);
  },

  _cast(_value, _opts) {
    const value = _mixed.default.prototype._cast.call(this, _value, _opts); //should ignore nulls here


    if (!this._typeCheck(value) || !this.innerType) return value;
    let isChanged = false;
    const castArray = value.map((v, idx) => {
      const castElement = this.innerType.cast(v, { ..._opts,
        path: (0, _makePath.default)`${_opts.path}[${idx}]`
      });

      if (castElement !== v) {
        isChanged = true;
      }

      return castElement;
    });
    return isChanged ? castArray : value;
  },

  _validate(_value, options = {}) {
    let errors = [];
    let sync = options.sync;
    let path = options.path;
    let innerType = this.innerType;

    let endEarly = this._option('abortEarly', options);

    let recursive = this._option('recursive', options);

    let originalValue = options.originalValue != null ? options.originalValue : _value;
    return _mixed.default.prototype._validate.call(this, _value, options).catch((0, _runValidations.propagateErrors)(endEarly, errors)).then(value => {
      if (!recursive || !innerType || !this._typeCheck(value)) {
        if (errors.length) throw errors[0];
        return value;
      }

      originalValue = originalValue || value; // #950 Ensure that sparse array empty slots are validated

      let validations = new Array(value.length);

      for (let idx = 0; idx < value.length; idx++) {
        let item = value[idx];
        let path = (0, _makePath.default)`${options.path}[${idx}]`; // object._validate note for isStrict explanation

        var innerOptions = { ...options,
          path,
          strict: true,
          parent: value,
          index: idx,
          originalValue: originalValue[idx]
        };
        validations[idx] = innerType.validate ? innerType.validate(item, innerOptions) : true;
      }

      return (0, _runValidations.default)({
        sync,
        path,
        value,
        errors,
        endEarly,
        validations
      });
    });
  },

  _isPresent(value) {
    return _mixed.default.prototype._isPresent.call(this, value) && value.length > 0;
  },

  of(schema) {
    var next = this.clone();
    if (schema !== false && !(0, _isSchema.default)(schema)) throw new TypeError('`array.of()` sub-schema must be a valid yup schema, or `false` to negate a current sub-schema. ' + 'not: ' + (0, _printValue.default)(schema));
    next._subType = schema;
    next.innerType = schema;
    return next;
  },

  min(min, message) {
    message = message || _locale.array.min;
    return this.test({
      message,
      name: 'min',
      exclusive: true,
      params: {
        min
      },

      test(value) {
        return (0, _isAbsent.default)(value) || value.length >= this.resolve(min);
      }

    });
  },

  max(max, message) {
    message = message || _locale.array.max;
    return this.test({
      message,
      name: 'max',
      exclusive: true,
      params: {
        max
      },

      test(value) {
        return (0, _isAbsent.default)(value) || value.length <= this.resolve(max);
      }

    });
  },

  ensure() {
    return this.default(() => []).transform((val, original) => {
      // We don't want to return `null` for nullable schema
      if (this._typeCheck(val)) return val;
      return original == null ? [] : [].concat(original);
    });
  },

  compact(rejector) {
    let reject = !rejector ? v => !!v : (v, i, a) => !rejector(v, i, a);
    return this.transform(values => values != null ? values.filter(reject) : values);
  },

  describe() {
    let base = _mixed.default.prototype.describe.call(this);

    if (this.innerType) base.innerType = this.innerType.describe();
    return base;
  }

});