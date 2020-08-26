"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ObjectSchema;

var _has = _interopRequireDefault(require("lodash/has"));

var _snakeCase = _interopRequireDefault(require("lodash/snakeCase"));

var _camelCase = _interopRequireDefault(require("lodash/camelCase"));

var _mapKeys = _interopRequireDefault(require("lodash/mapKeys"));

var _mapValues = _interopRequireDefault(require("lodash/mapValues"));

var _propertyExpr = require("property-expr");

var _mixed = _interopRequireDefault(require("./mixed"));

var _locale = require("./locale.js");

var _sortFields = _interopRequireDefault(require("./util/sortFields"));

var _sortByKeyOrder = _interopRequireDefault(require("./util/sortByKeyOrder"));

var _inherits = _interopRequireDefault(require("./util/inherits"));

var _makePath = _interopRequireDefault(require("./util/makePath"));

var _runValidations = _interopRequireWildcard(require("./util/runValidations"));

var _synchronousPromise = require("synchronous-promise");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';

let promise = sync => sync ? _synchronousPromise.SynchronousPromise : Promise;

function unknown(ctx, value) {
  let known = Object.keys(ctx.fields);
  return Object.keys(value).filter(key => known.indexOf(key) === -1);
}

function ObjectSchema(spec) {
  if (!(this instanceof ObjectSchema)) return new ObjectSchema(spec);

  _mixed.default.call(this, {
    type: 'object',

    default() {
      if (!this._nodes.length) return undefined;
      let dft = {};

      this._nodes.forEach(key => {
        dft[key] = this.fields[key].default ? this.fields[key].default() : undefined;
      });

      return dft;
    }

  });

  this.fields = Object.create(null);
  this._nodes = [];
  this._excludedEdges = [];
  this.withMutation(() => {
    this.transform(function coerce(value) {
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (err) {
          value = null;
        }
      }

      if (this.isType(value)) return value;
      return null;
    });

    if (spec) {
      this.shape(spec);
    }
  });
}

(0, _inherits.default)(ObjectSchema, _mixed.default, {
  _typeCheck(value) {
    return isObject(value) || typeof value === 'function';
  },

  _cast(_value, options = {}) {
    let value = _mixed.default.prototype._cast.call(this, _value, options); //should ignore nulls here


    if (value === undefined) return this.default();
    if (!this._typeCheck(value)) return value;
    let fields = this.fields;
    let strip = this._option('stripUnknown', options) === true;

    let props = this._nodes.concat(Object.keys(value).filter(v => this._nodes.indexOf(v) === -1));

    let intermediateValue = {}; // is filled during the transform below

    let innerOptions = { ...options,
      parent: intermediateValue,
      __validating: options.__validating || false
    };
    let isChanged = false;
    props.forEach(prop => {
      let field = fields[prop];
      let exists = (0, _has.default)(value, prop);

      if (field) {
        let fieldValue;
        let strict = field._options && field._options.strict; // safe to mutate since this is fired in sequence

        innerOptions.path = (0, _makePath.default)`${options.path}.${prop}`;
        innerOptions.value = value[prop];
        field = field.resolve(innerOptions);

        if (field._strip === true) {
          isChanged = isChanged || prop in value;
          return;
        }

        fieldValue = !options.__validating || !strict ? field.cast(value[prop], innerOptions) : value[prop];
        if (fieldValue !== undefined) intermediateValue[prop] = fieldValue;
      } else if (exists && !strip) intermediateValue[prop] = value[prop];

      if (intermediateValue[prop] !== value[prop]) isChanged = true;
    });
    return isChanged ? intermediateValue : value;
  },

  _validate(_value, opts = {}) {
    let endEarly, recursive;
    let sync = opts.sync;
    let errors = [];
    let originalValue = opts.originalValue != null ? opts.originalValue : _value;
    let from = [{
      schema: this,
      value: originalValue
    }, ...(opts.from || [])];
    endEarly = this._option('abortEarly', opts);
    recursive = this._option('recursive', opts);
    opts = { ...opts,
      __validating: true,
      originalValue,
      from
    };
    return _mixed.default.prototype._validate.call(this, _value, opts).catch((0, _runValidations.propagateErrors)(endEarly, errors)).then(value => {
      if (!recursive || !isObject(value)) {
        // only iterate though actual objects
        if (errors.length) throw errors[0];
        return value;
      }

      from = originalValue ? [...from] : [{
        schema: this,
        value: originalValue || value
      }, ...(opts.from || [])];
      originalValue = originalValue || value;

      let validations = this._nodes.map(key => {
        let path = key.indexOf('.') === -1 ? (0, _makePath.default)`${opts.path}.${key}` : (0, _makePath.default)`${opts.path}["${key}"]`;
        let field = this.fields[key];
        let innerOptions = { ...opts,
          path,
          from,
          parent: value,
          originalValue: originalValue[key]
        };

        if (field && field.validate) {
          // inner fields are always strict:
          // 1. this isn't strict so the casting will also have cast inner values
          // 2. this is strict in which case the nested values weren't cast either
          innerOptions.strict = true;
          return field.validate(value[key], innerOptions);
        }

        return promise(sync).resolve(true);
      });

      return (0, _runValidations.default)({
        sync,
        validations,
        value,
        errors,
        endEarly,
        path: opts.path,
        sort: (0, _sortByKeyOrder.default)(this.fields)
      });
    });
  },

  concat(schema) {
    var next = _mixed.default.prototype.concat.call(this, schema);

    next._nodes = (0, _sortFields.default)(next.fields, next._excludedEdges);
    return next;
  },

  shape(schema, excludes = []) {
    let next = this.clone();
    let fields = Object.assign(next.fields, schema);
    next.fields = fields;

    if (excludes.length) {
      if (!Array.isArray(excludes[0])) excludes = [excludes];
      let keys = excludes.map(([first, second]) => `${first}-${second}`);
      next._excludedEdges = next._excludedEdges.concat(keys);
    }

    next._nodes = (0, _sortFields.default)(fields, next._excludedEdges);
    return next;
  },

  from(from, to, alias) {
    let fromGetter = (0, _propertyExpr.getter)(from, true);
    return this.transform(obj => {
      if (obj == null) return obj;
      let newObj = obj;

      if ((0, _has.default)(obj, from)) {
        newObj = { ...obj
        };
        if (!alias) delete newObj[from];
        newObj[to] = fromGetter(obj);
      }

      return newObj;
    });
  },

  noUnknown(noAllow = true, message = _locale.object.noUnknown) {
    if (typeof noAllow === 'string') {
      message = noAllow;
      noAllow = true;
    }

    let next = this.test({
      name: 'noUnknown',
      exclusive: true,
      message: message,

      test(value) {
        if (value == null) return true;
        const unknownKeys = unknown(this.schema, value);
        return !noAllow || unknownKeys.length === 0 || this.createError({
          params: {
            unknown: unknownKeys.join(', ')
          }
        });
      }

    });
    next._options.stripUnknown = noAllow;
    return next;
  },

  unknown(allow = true, message = _locale.object.noUnknown) {
    return this.noUnknown(!allow, message);
  },

  transformKeys(fn) {
    return this.transform(obj => obj && (0, _mapKeys.default)(obj, (_, key) => fn(key)));
  },

  camelCase() {
    return this.transformKeys(_camelCase.default);
  },

  snakeCase() {
    return this.transformKeys(_snakeCase.default);
  },

  constantCase() {
    return this.transformKeys(key => (0, _snakeCase.default)(key).toUpperCase());
  },

  describe() {
    let base = _mixed.default.prototype.describe.call(this);

    base.fields = (0, _mapValues.default)(this.fields, value => value.describe());
    return base;
  }

});