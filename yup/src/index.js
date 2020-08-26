import mixed from './mixed.js';
import bool from './boolean.js';
import string from './string.js';
import number from './number.js';
import date from './date.js';
import object from './object.js';
import array from './array.js';
import Ref from './Reference.js';
import Lazy from './Lazy.js';
import ValidationError from './ValidationError.js';
import reach from './util/reach.js';
import isSchema from './util/isSchema.js';
import setLocale from './setLocale.js';

let boolean = bool;
let ref = (key, options) => new Ref(key, options);

let lazy = fn => new Lazy(fn);

function addMethod(schemaType, name, fn) {
  if (!schemaType || !isSchema(schemaType.prototype))
    throw new TypeError('You must provide a yup schema constructor function');

  if (typeof name !== 'string')
    throw new TypeError('A Method name must be provided');
  if (typeof fn !== 'function')
    throw new TypeError('Method function must be provided');

  schemaType.prototype[name] = fn;
}

export default {
  mixed,
  string,
  number,
  bool,
  boolean,
  date,
  object,
  array,
  ref,
  lazy,
  reach,
  isSchema,
  addMethod,
  setLocale,
  ValidationError,
};
