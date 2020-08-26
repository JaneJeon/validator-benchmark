"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createErrorFactory = createErrorFactory;
exports.default = createValidation;

var _mapValues = _interopRequireDefault(require("lodash/mapValues"));

var _ValidationError = _interopRequireDefault(require("../ValidationError"));

var _Reference = _interopRequireDefault(require("../Reference"));

var _synchronousPromise = require("synchronous-promise");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let formatError = _ValidationError.default.formatError;

let thenable = p => p && typeof p.then === 'function' && typeof p.catch === 'function';

function runTest(testFn, ctx, value, sync) {
  let result = testFn.call(ctx, value);
  if (!sync) return Promise.resolve(result);

  if (thenable(result)) {
    throw new Error(`Validation test of type: "${ctx.type}" returned a Promise during a synchronous validate. ` + `This test will finish after the validate call has returned`);
  }

  return _synchronousPromise.SynchronousPromise.resolve(result);
}

function resolveParams(oldParams, newParams, resolve) {
  return (0, _mapValues.default)({ ...oldParams,
    ...newParams
  }, resolve);
}

function createErrorFactory({
  value,
  label,
  resolve,
  originalValue,
  ...opts
}) {
  return function createError({
    path = opts.path,
    message = opts.message,
    type = opts.name,
    params
  } = {}) {
    params = {
      path,
      value,
      originalValue,
      label,
      ...resolveParams(opts.params, params, resolve)
    };
    return Object.assign(new _ValidationError.default(formatError(message, params), value, path, type), {
      params
    });
  };
}

function createValidation(options) {
  let {
    name,
    message,
    test,
    params
  } = options;

  function validate({
    value,
    path,
    label,
    options,
    originalValue,
    sync,
    ...rest
  }) {
    let parent = options.parent;

    let resolve = item => _Reference.default.isRef(item) ? item.getValue({
      value,
      parent,
      context: options.context
    }) : item;

    let createError = createErrorFactory({
      message,
      path,
      value,
      originalValue,
      params,
      label,
      resolve,
      name
    });
    let ctx = {
      path,
      parent,
      type: name,
      createError,
      resolve,
      options,
      ...rest
    };
    return runTest(test, ctx, value, sync).then(validOrError => {
      if (_ValidationError.default.isError(validOrError)) throw validOrError;else if (!validOrError) throw createError();
    });
  }

  validate.OPTIONS = options;
  return validate;
}