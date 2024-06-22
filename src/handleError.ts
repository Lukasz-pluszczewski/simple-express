import _ from "lodash";
import { ErrorHandler, HandlerParams } from "./types";

const validateErrorClass = (errorClass: ErrorClass) => {
  if (errorClass && !_.isFunction(errorClass)) {
    throw new Error(
      `handleError arguments error: expected constructor (e.g. Error class) but got ${typeof errorClass}`
    );
  }
};

const validateHandler = (errorHandler: ErrorHandler) => {
  if (!_.isFunction(errorHandler)) {
    throw new Error(
      `handleError arguments error: expected error handler function but got ${typeof errorHandler}`
    );
  }
};

interface ErrorClass {
  new (name: string): Error;
}

type ErrorHandlerTuple = [errorClass: ErrorClass | ErrorClass[], errorHandler: ErrorHandler];
type HandlerTuple = [errorHandler: ErrorHandler];

type HandleErrorList = [...ErrorHandlerTuple[], HandlerTuple | ErrorHandler] | ErrorHandlerTuple[];

type HandleErrorArguments = ErrorHandlerTuple
  | HandlerTuple
  | [HandleErrorList]

type GetArgsReturnType = [ErrorClass | null, ErrorHandler];

const getArgs = (args: HandleErrorArguments): GetArgsReturnType[] => {
  if (args.length === 1 && Array.isArray(args[0])) {
    return (args[0] as HandleErrorList).reduce<GetArgsReturnType[]>((accu: GetArgsReturnType[], el: ErrorHandlerTuple | HandlerTuple | ErrorHandler) => {
      if (!Array.isArray(el)) {
        accu.push([null, el] as GetArgsReturnType);
      } else if (el.length === 1) {
        accu.push([null, el[0]] as GetArgsReturnType);
      } else if (Array.isArray(el[0])) {
        el[0].forEach((errorInstance) => {
          accu.push([errorInstance, el[1]] as GetArgsReturnType);
        });
      } else {
        accu.push(el as GetArgsReturnType);
      }

      return accu;
    }, []);
  }

  if (args.length === 1) {
    return [[null, args[0]]] as GetArgsReturnType[];
  }

  if (Array.isArray(args[0])) {
    return args[0].map((errorInstance) => [errorInstance, args[1]]);
  }

  return [args as GetArgsReturnType];
};

const handleError = ([errorClass, errorHandler]: [errorClass: ErrorClass | null, errorHandler: ErrorHandler]) => {
  validateErrorClass(errorClass);
  validateHandler(errorHandler);

  return (error: Error, handlerParams: Omit<HandlerParams, 'params'>) => {
    if (!errorClass || error instanceof errorClass) {
      return errorHandler(error, handlerParams);
    }
    return error;
  };
};

export default (...args: HandleErrorArguments) => {
  const errorHandlers = getArgs(args);

  return errorHandlers.map(handleError);
};
