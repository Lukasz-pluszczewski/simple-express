import _ from "lodash";
import { ErrorHandler, HandlerParams } from "./types";

const validateErrorClass = (errorClass: ErrorClass) => {
  if (errorClass && !_.isFunction(errorClass)) {
    throw new Error(
      `handleError arguments error: expected constructor (e.g. Error class) but got ${typeof errorClass}`
    );
  }
};

const validateHandler = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(errorHandler: ErrorHandler<AdditionalRouteParams, TLocals>) => {
  if (!_.isFunction(errorHandler)) {
    throw new Error(
      `handleError arguments error: expected error handler function but got ${typeof errorHandler}`
    );
  }
};

interface ErrorClass {
  new (name: string): Error;
}

type ErrorHandlerTuple<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = [errorClass: ErrorClass | ErrorClass[], errorHandler: ErrorHandler<AdditionalRouteParams, TLocals>];
type HandlerTuple<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = [errorHandler: ErrorHandler<AdditionalRouteParams, TLocals>];

type HandleErrorList<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = [...ErrorHandlerTuple<AdditionalRouteParams, TLocals>, HandlerTuple<AdditionalRouteParams, TLocals> | ErrorHandler<AdditionalRouteParams, TLocals>] | ErrorHandlerTuple<AdditionalRouteParams, TLocals>[];

type HandleErrorArguments<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = ErrorHandlerTuple<AdditionalRouteParams, TLocals>
  | HandlerTuple<AdditionalRouteParams, TLocals>
  | [HandleErrorList<AdditionalRouteParams, TLocals>];

type GetArgsReturnType<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = [ErrorClass | null, ErrorHandler<AdditionalRouteParams, TLocals>];

const getArgs = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(args: HandleErrorArguments<AdditionalRouteParams, TLocals>): GetArgsReturnType<AdditionalRouteParams, TLocals>[] => {
  if (args.length === 1 && Array.isArray(args[0])) {
    return (args[0] as HandleErrorList<AdditionalRouteParams, TLocals>).reduce<GetArgsReturnType<AdditionalRouteParams, TLocals>[]>((accu: GetArgsReturnType<AdditionalRouteParams, TLocals>[], el: ErrorHandlerTuple<AdditionalRouteParams, TLocals> | HandlerTuple<AdditionalRouteParams, TLocals> | ErrorHandler<AdditionalRouteParams, TLocals> | any) => {
      if (!Array.isArray(el)) {
        accu.push([null, el] as GetArgsReturnType<AdditionalRouteParams, TLocals>);
      } else if (el.length === 1) {
        accu.push([null, el[0]] as GetArgsReturnType<AdditionalRouteParams, TLocals>);
      } else if (Array.isArray(el[0])) {
        el[0].forEach((errorInstance) => {
          accu.push([errorInstance, el[1]] as GetArgsReturnType<AdditionalRouteParams, TLocals>);
        });
      } else {
        accu.push(el as GetArgsReturnType<AdditionalRouteParams, TLocals>);
      }

      return accu;
    }, []);
  }

  if (args.length === 1) {
    return [[null, args[0]]] as GetArgsReturnType<AdditionalRouteParams, TLocals>[];
  }

  if (Array.isArray(args[0])) {
    return args[0].map((errorInstance) => [errorInstance, args[1]]);
  }

  return [args as GetArgsReturnType<AdditionalRouteParams, TLocals>];
};

const handleError = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>([errorClass, errorHandler]: [errorClass: ErrorClass | null, errorHandler: ErrorHandler<AdditionalRouteParams, TLocals>]) => {
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
