import _ from "lodash";
import { HandlerParams, SingleErrorHandler } from './types';

const validateErrorClass = (errorClass: ErrorClass) => {
  if (errorClass && !_.isFunction(errorClass)) {
    throw new Error(
      `handleError arguments error: expected constructor (e.g. Error class) but got ${typeof errorClass}`
    );
  }
};

const validateHandler = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(errorHandler: SingleErrorHandler<AdditionalRouteParams, TLocals>) => {
  if (!_.isFunction(errorHandler)) {
    throw new Error(
      `handleError arguments error: expected error handler function but got ${typeof errorHandler}`
    );
  }
};

interface ErrorClass {
  new (name: string): Error;
}

/**
 handleErrors(ErrorClass, ErrorHandler)
 or
 handleErrors(ErrorClass[], ErrorHandler)
 */
type ErrorHandlerTuple<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> =
  [errorClass: ErrorClass | ErrorClass[] | undefined | null, errorHandler: SingleErrorHandler<AdditionalRouteParams, TLocals>];

/**
 handleErrors(ErrorHandler)
 */
type SingleErrorHandlerTuple<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> =
  [errorHandler: SingleErrorHandler<AdditionalRouteParams, TLocals>];

/**
 handleErrors([
   [ErrorClass1, ErrorHandler1],
   [ErrorClass2, ErrorHandler2],
 ])
 or
 handleErrors([
   [[ErrorClass1a, ErrorClass1b], ErrorHandler1],
   [ErrorClass2, ErrorHandler2],
 ],
 or
 handleErrors([
   [ErrorClass1, ErrorHandler1],
   ErrorHandler2,
 ],
 or
 handleErrors([
   [ErrorClass1, ErrorHandler1],
   [ErrorHandler2],
 ],
 */
type MultipleErrorHandlers<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> =
  [(ErrorHandlerTuple<AdditionalRouteParams, TLocals> | SingleErrorHandlerTuple<AdditionalRouteParams, TLocals> | SingleErrorHandler<AdditionalRouteParams, TLocals>)[]];

/**
 handleErrors([
   [ErrorClass1, ErrorHandler1],
   [ErrorClass2, ErrorHandler2],
 ], DefaultErrorHandler)
 */
type MultipleErrorHandlersWithDefault<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> =
  [(ErrorHandlerTuple<AdditionalRouteParams, TLocals> | SingleErrorHandlerTuple<AdditionalRouteParams, TLocals> | SingleErrorHandler<AdditionalRouteParams, TLocals>)[], SingleErrorHandler<AdditionalRouteParams, TLocals>];

type HandleErrorArguments<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> =
  | ErrorHandlerTuple<AdditionalRouteParams, TLocals>
  | SingleErrorHandlerTuple<AdditionalRouteParams, TLocals>
  | MultipleErrorHandlers<AdditionalRouteParams, TLocals>
  | MultipleErrorHandlersWithDefault<AdditionalRouteParams, TLocals>;

export const getArgs = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(
  args: HandleErrorArguments<AdditionalRouteParams, TLocals>
) => {
  const results: [errorClass: ErrorClass | null, errorHandler: SingleErrorHandler<AdditionalRouteParams, TLocals>][] = [];
  if (Array.isArray(args[0]) && args.length === 2 && typeof args[0][0] === 'function') {
    /*
      handleErrors(ErrorClass[], ErrorHandler)
     */
    args[0].forEach((errorClass) => {
      results.push([errorClass, args[1]]);
    });
  } else if (Array.isArray(args[0])) {
    /*
      handleErrors([
        [ErrorClass1, ErrorHandler1],
        [ErrorClass2, ErrorHandler2],
      ])
     */
    args[0].forEach((tuple) => {
      if (tuple.length === 1) {
        /*
          handleErrors([
            [ErrorClass1, ErrorHandler1],
            [ErrorHandler2], <-- we're here
          ])
         */
        results.push([null, tuple[0]]);
      } else if (!Array.isArray(tuple)) {
        /*
          handleErrors([
            [ErrorClass1, ErrorHandler1],
            ErrorHandler2, <-- we're here
          ])
         */
        results.push([null, tuple]);
      } else if (Array.isArray(tuple[0])) {
        /*
          handleErrors([
            [ErrorClass1, ErrorClass2], <-- we're here
            ErrorHandler1
          ])
         */
        tuple[0].forEach((errorClass) => {
          results.push([errorClass, tuple[1]]);
        });
      } else {
        results.push([tuple[0], tuple[1]]);
      }
    });

    if (args[1]) {
      /*
        handleErrors(
          [
            [ErrorClass1, ErrorHandler1],
          ],
          DefaultErrorHandler <-- we're here
        )
       */
      results.push([null, args[1]]);
    }
  } else if (args.length === 1) {
    /*
      handleErrors(ErrorHandler)
     */
    results.push([null, args[0]]);
  } else if (args.length === 2) {
    /*
      handleErrors(ErrorClass, ErrorHandler)
     */
    results.push([args[0], args[1]]);
  } else {
    throw new Error('handleErrors arguments error: expected 1 or 2 arguments');
  }

  return results;
}

const handleError = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>([errorClass, errorHandler]: [errorClass: ErrorClass | null, errorHandler: SingleErrorHandler<AdditionalRouteParams, TLocals>]) => {
  validateErrorClass(errorClass);
  validateHandler(errorHandler);

  return (error: Error, handlerParams: Omit<HandlerParams<TLocals>, 'params'> & AdditionalRouteParams) => {
    if (!errorClass || error instanceof errorClass) {
      return errorHandler(error, handlerParams);
    }
    return error;
  };
};

export default <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(...args: HandleErrorArguments<AdditionalRouteParams, TLocals>) => {
  const errorHandlers = getArgs(args);

  return errorHandlers.map(handleError);
};
