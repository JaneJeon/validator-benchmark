"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.propagateErrors = propagateErrors;
exports.settled = settled;
exports.collectErrors = collectErrors;
exports.default = runValidations;

var _synchronousPromise = require("synchronous-promise");

var _ValidationError = _interopRequireDefault(require("../ValidationError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let promise = sync => sync ? _synchronousPromise.SynchronousPromise : Promise;

let unwrapError = (errors = []) => errors.inner && errors.inner.length ? errors.inner : [].concat(errors);

function scopeToValue(promises, value, sync) {
  //console.log('scopeToValue', promises, value)
  let p = promise(sync).all(promises); //console.log('scopeToValue B', p)

  let b = p.catch(err => {
    if (err.name === 'ValidationError') err.value = value;
    throw err;
  }); //console.log('scopeToValue c', b)

  let c = b.then(() => value); //console.log('scopeToValue d', c)

  return c;
}
/**
 * If not failing on the first error, catch the errors
 * and collect them in an array
 */


function propagateErrors(endEarly, errors) {
  return endEarly ? null : err => {
    errors.push(err);
    return err.value;
  };
}

function settled(promises, sync) {
  const Promise = promise(sync);
  return Promise.all(promises.map(p => Promise.resolve(p).then(value => ({
    fulfilled: true,
    value
  }), value => ({
    fulfilled: false,
    value
  }))));
}

function collectErrors({
  validations,
  value,
  path,
  sync,
  errors,
  sort
}) {
  errors = unwrapError(errors);
  return settled(validations, sync).then(results => {
    let nestedErrors = results.filter(r => !r.fulfilled).reduce((arr, {
      value: error
    }) => {
      // we are only collecting validation errors
      if (!_ValidationError.default.isError(error)) {
        throw error;
      }

      return arr.concat(error);
    }, []);
    if (sort) nestedErrors.sort(sort); //show parent errors after the nested ones: name.first, name

    errors = nestedErrors.concat(errors);
    if (errors.length) throw new _ValidationError.default(errors, value, path);
    return value;
  });
}

function runValidations({
  endEarly,
  ...options
}) {
  if (endEarly) return scopeToValue(options.validations, options.value, options.sync);
  return collectErrors(options);
}