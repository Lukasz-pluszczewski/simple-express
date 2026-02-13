import _ from 'lodash';

import { ErrorClass, HandlerParams, SingleErrorHandler } from './types';

const validateErrorClass = (errorClass: ErrorClass) => {
  if (errorClass && !_.isFunction(errorClass)) {
    throw new Error(
      `handleError arguments error: expected constructor (e.g. Error class) but got ${typeof errorClass}`
    );
  }
};

const validateHandler = <
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
  TError extends Error = Error,
>(
  errorHandler: SingleErrorHandler<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext,
    TError
  >
) => {
  if (!_.isFunction(errorHandler)) {
    throw new Error(
      `handleError arguments error: expected error handler function but got ${typeof errorHandler}`
    );
  }
};

type ErrorClassInput =
  | ErrorClass<any>
  | readonly ErrorClass<any>[]
  | undefined
  | null;

type InferErrorFromClassInput<TErrorClassInput extends ErrorClassInput> =
  TErrorClassInput extends readonly ErrorClass<any>[]
    ? InstanceType<TErrorClassInput[number]>
    : TErrorClassInput extends ErrorClass<any>
      ? InstanceType<TErrorClassInput>
      : Error;

type FallbackErrorHandler<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
> = SingleErrorHandler<
  AdditionalRouteParams,
  TLocals,
  TRequestContext,
  TGlobalContext,
  Error
>;

type ErrorHandlerTupleForClassInput<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
  TErrorClassInput extends ErrorClassInput = ErrorClassInput,
> = readonly [
  errorClass: TErrorClassInput,
  errorHandler: SingleErrorHandler<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext,
    InferErrorFromClassInput<TErrorClassInput>
  >,
];

type SingleErrorHandlerTuple<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
> = readonly [
  errorHandler: FallbackErrorHandler<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext
  >,
];

type ErrorHandlersList<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
  TClassInputs extends readonly ErrorClassInput[] = readonly ErrorClassInput[],
> = {
  [K in keyof TClassInputs]:
    | ErrorHandlerTupleForClassInput<
        AdditionalRouteParams,
        TLocals,
        TRequestContext,
        TGlobalContext,
        TClassInputs[K]
      >
    | SingleErrorHandlerTuple<
        AdditionalRouteParams,
        TLocals,
        TRequestContext,
        TGlobalContext
      >
    | FallbackErrorHandler<
        AdditionalRouteParams,
        TLocals,
        TRequestContext,
        TGlobalContext
      >;
};

type RuntimeErrorHandler<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
> = SingleErrorHandler<
  AdditionalRouteParams,
  TLocals,
  TRequestContext,
  TGlobalContext,
  any
>;

type RuntimeErrorClassInput =
  | ErrorClass<any>
  | readonly ErrorClass<any>[]
  | undefined
  | null;

type RuntimeErrorHandlerTuple<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
> = readonly [
  errorClass: RuntimeErrorClassInput,
  errorHandler: RuntimeErrorHandler<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext
  >,
];

type RuntimeSingleErrorHandlerTuple<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
> = readonly [
  errorHandler: RuntimeErrorHandler<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext
  >,
];

type RuntimeHandlersEntry<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
> =
  | RuntimeErrorHandlerTuple<
      AdditionalRouteParams,
      TLocals,
      TRequestContext,
      TGlobalContext
    >
  | RuntimeSingleErrorHandlerTuple<
      AdditionalRouteParams,
      TLocals,
      TRequestContext,
      TGlobalContext
    >
  | RuntimeErrorHandler<
      AdditionalRouteParams,
      TLocals,
      TRequestContext,
      TGlobalContext
    >;

type HandleErrorRuntimeArguments<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
> =
  | RuntimeErrorHandlerTuple<
      AdditionalRouteParams,
      TLocals,
      TRequestContext,
      TGlobalContext
    >
  | RuntimeSingleErrorHandlerTuple<
      AdditionalRouteParams,
      TLocals,
      TRequestContext,
      TGlobalContext
    >
  | readonly [
      handlers: readonly RuntimeHandlersEntry<
        AdditionalRouteParams,
        TLocals,
        TRequestContext,
        TGlobalContext
      >[],
    ]
  | readonly [
      handlers: readonly RuntimeHandlersEntry<
        AdditionalRouteParams,
        TLocals,
        TRequestContext,
        TGlobalContext
      >[],
      defaultErrorHandler: RuntimeErrorHandler<
        AdditionalRouteParams,
        TLocals,
        TRequestContext,
        TGlobalContext
      >,
    ];

export const getArgs = <
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
>(
  args: HandleErrorRuntimeArguments<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext
  >
) => {
  const results: [
    errorClass: ErrorClass<any> | null,
    errorHandler: RuntimeErrorHandler<
      AdditionalRouteParams,
      TLocals,
      TRequestContext,
      TGlobalContext
    >,
  ][] = [];
  if (
    Array.isArray(args[0])
    && args.length === 2
    && typeof args[0][0] === 'function'
  ) {
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
    results.push([
      null,
      args[0] as RuntimeErrorHandler<
        AdditionalRouteParams,
        TLocals,
        TRequestContext,
        TGlobalContext
      >,
    ]);
  } else if (args.length === 2) {
    /*
      handleErrors(ErrorClass, ErrorHandler)
     */
    results.push([
      args[0] as ErrorClass<any>,
      args[1] as RuntimeErrorHandler<
        AdditionalRouteParams,
        TLocals,
        TRequestContext,
        TGlobalContext
      >,
    ]);
  } else {
    throw new Error('handleErrors arguments error: expected 1 or 2 arguments');
  }

  return results;
};

const handleErrorInternal = <
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
>([errorClass, errorHandler]: [
  errorClass: ErrorClass<any> | null,
  errorHandler: RuntimeErrorHandler<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext
  >,
]) => {
  validateErrorClass(errorClass);
  validateHandler(errorHandler);

  return (
    error: Error,
    handlerParams: Omit<
      HandlerParams<TLocals, TRequestContext, TGlobalContext>,
      'params'
    >
      & AdditionalRouteParams
  ) => {
    if (!errorClass || error instanceof errorClass) {
      return errorHandler(error, handlerParams);
    }
    return error;
  };
};

type HandleErrorReturn<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
> = FallbackErrorHandler<
  AdditionalRouteParams,
  TLocals,
  TRequestContext,
  TGlobalContext
>[];

function handleErrors<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
  TErrorClass extends ErrorClass<any> = ErrorClass<any>,
>(
  errorClass: TErrorClass,
  errorHandler: SingleErrorHandler<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext,
    InstanceType<TErrorClass>
  >
): HandleErrorReturn<
  AdditionalRouteParams,
  TLocals,
  TRequestContext,
  TGlobalContext
>;
function handleErrors<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
  TErrorClasses extends readonly ErrorClass<any>[] = readonly ErrorClass<any>[],
>(
  errorClasses: TErrorClasses,
  errorHandler: SingleErrorHandler<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext,
    InstanceType<TErrorClasses[number]>
  >
): HandleErrorReturn<
  AdditionalRouteParams,
  TLocals,
  TRequestContext,
  TGlobalContext
>;
function handleErrors<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
>(
  errorHandler: FallbackErrorHandler<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext
  >
): HandleErrorReturn<
  AdditionalRouteParams,
  TLocals,
  TRequestContext,
  TGlobalContext
>;
function handleErrors<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
  TClassInputs extends readonly ErrorClassInput[] = readonly ErrorClassInput[],
>(
  handlers: ErrorHandlersList<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext,
    TClassInputs
  >
): HandleErrorReturn<
  AdditionalRouteParams,
  TLocals,
  TRequestContext,
  TGlobalContext
>;
function handleErrors<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
  TClassInputs extends readonly ErrorClassInput[] = readonly ErrorClassInput[],
>(
  handlers: ErrorHandlersList<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext,
    TClassInputs
  >,
  defaultErrorHandler: FallbackErrorHandler<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext
  >
): HandleErrorReturn<
  AdditionalRouteParams,
  TLocals,
  TRequestContext,
  TGlobalContext
>;
function handleErrors<
  AdditionalRouteParams extends Record<string, unknown>,
  TLocals extends Record<string, unknown>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>,
>(
  ...args: HandleErrorRuntimeArguments<
    AdditionalRouteParams,
    TLocals,
    TRequestContext,
    TGlobalContext
  >
): HandleErrorReturn<
  AdditionalRouteParams,
  TLocals,
  TRequestContext,
  TGlobalContext
> {
  const errorHandlers = getArgs(args);

  return errorHandlers.map(handleErrorInternal);
}

export default handleErrors;
