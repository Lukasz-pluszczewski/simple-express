import _ from 'lodash';

const validateErrorClass = errorClass => {
  if (errorClass && !_.isFunction(errorClass)) {
    throw new Error(`handleError arguments error: expected constructor (e.g. Error class) but got ${typeof errorClass}`);
  }
};

const validateHandler = errorHandler => {
  if (!_.isFunction(errorHandler)) {
    throw new Error(`handleError arguments error: expected error handler function but got ${typeof errorHandler}`);
  }
};

const getArgs = args => {
  if (args.length === 1 && Array.isArray(args[0])) {
    return args[0].reduce((accu, el) => {
      if (!Array.isArray(el)) {
        accu.push([null, el]);
      } else if (el.length === 1) {
        accu.push([null, el[0]]);
      } else if (Array.isArray(el[0])) {
        el[0].forEach(errorInstance => {
          accu.push([errorInstance, el[1]]);
        });
      } else {
        accu.push(el);
      }

      return accu;
    }, []);
  }

  if (args.length === 1) {
    return [[null, args[0]]];
  }

  if (Array.isArray(args[0])) {
    return args[0].map(errorInstance => [errorInstance, args[1]]);
  }

  return [args];
};

const handleError = ([errorClass, errorHandler]) => {
  validateErrorClass(errorClass);
  validateHandler(errorHandler);

  return (error, handlerParams) => {
    if (!errorClass || error instanceof errorClass) {
      return errorHandler(error, handlerParams);
    }
    return error;
  }
};

export default (...args) => {
  const errorHandlers = getArgs(args);

  return errorHandlers.map(handleError);
};
