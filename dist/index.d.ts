import { Request, Response, Handler as Handler$1, Application } from 'express';
import { CorsOptions, CorsOptionsDelegate } from 'cors';
import cookieParser from 'cookie-parser';
import { OptionsJson } from 'body-parser';
import { Server } from 'http';
import { Server as Server$1 } from 'https';

declare const getStats: (port: any) => {
    set: (field: any, number?: number) => number;
    add: (field: any, number?: number) => number;
    getCounter: (field: any) => number;
    registerEvent: (eventName: any, data: any) => void;
    getEvents: (eventName: any) => any;
    logStartup: () => any;
};

type Config = {
    cors?: CorsOptions | CorsOptionsDelegate | false;
    jsonBodyParser?: OptionsJson | false;
    cookieParser?: [secret?: string | string[], options?: cookieParser.CookieParseOptions] | false;
};
type HandlerParams<TLocals extends Record<string, unknown> = Record<string, any>> = {
    body: any;
    query: any;
    params: any;
    method: string;
    originalUrl: string;
    protocol: string;
    xhr: boolean;
    getHeader: (x: string) => string;
    get: (x: string) => string;
    locals: TLocals;
    next: (error?: any) => void;
    req: Request & {
        requestTiming?: number;
    };
    res: Response;
};
type Headers = {
    [headerName: string]: string;
};
type ResponseDefinition = {
    body?: string | object | Buffer;
    status?: number;
    method?: string;
    redirect?: false | string;
    headers?: Headers;
    type?: string;
};
type Handler<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = ((handlerParams: HandlerParams<TLocals> & AdditionalRouteParams) => ResponseDefinition | Promise<ResponseDefinition> | Error | Promise<Error> | void | Promise<void> | Promise<void | ResponseDefinition | Error>) | Handler<AdditionalRouteParams, TLocals>[];
type SingleErrorHandler<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = (error: Error | any, handlerParams: Omit<HandlerParams<TLocals>, 'params'> & AdditionalRouteParams) => ResponseDefinition | Promise<ResponseDefinition> | Error | Promise<Error> | void | Promise<void> | Promise<void | ResponseDefinition | Error>;
type ErrorHandler<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = SingleErrorHandler<AdditionalRouteParams, TLocals> | ErrorHandler<AdditionalRouteParams, TLocals>[];
type HttpMethod = 'use' | 'get' | 'post' | 'put' | 'delete' | 'del' | 'options' | 'patch' | 'head' | 'checkout' | 'copy' | 'lock' | 'merge' | 'mkactivity' | 'mkcol' | 'move' | 'm-search' | 'notify' | 'purge' | 'report' | 'search' | 'subscribe' | 'trace' | 'unlock' | 'unsubscribe';
type Handlers<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = {
    [method in HttpMethod]?: Handler<AdditionalRouteParams, TLocals> | Handler<AdditionalRouteParams, TLocals>[];
};
type PathObjectRoutes<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = {
    [path: string]: Handler<AdditionalRouteParams, TLocals> | Handlers<AdditionalRouteParams, TLocals> | Handlers<AdditionalRouteParams, TLocals>[] | PathObjectRoutes<AdditionalRouteParams, TLocals> | PathObjectRoutes<AdditionalRouteParams, TLocals>[] | Routes<AdditionalRouteParams, TLocals>;
};
type ObjectRoute<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = {
    path: string;
    handlers?: Handlers<AdditionalRouteParams, TLocals> | Handlers<AdditionalRouteParams, TLocals>[];
    routes?: Routes<AdditionalRouteParams, TLocals>;
};
type ArrayOfArraysRest<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = Routes<AdditionalRouteParams, TLocals> | Handlers<AdditionalRouteParams, TLocals> | Handlers<AdditionalRouteParams, TLocals>[] | Handler<AdditionalRouteParams, TLocals> | Handler<AdditionalRouteParams, TLocals>[] | ArrayOfArrays<AdditionalRouteParams, TLocals> | ArrayOfArraysRest<AdditionalRouteParams, TLocals>[];
type ArrayOfArrays<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = [
    string,
    ...ArrayOfArraysRest<AdditionalRouteParams, TLocals>[]
];
type Routes<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = ObjectRoute<AdditionalRouteParams, TLocals>[] | Routes<AdditionalRouteParams, TLocals>[] | ArrayOfArrays<AdditionalRouteParams, TLocals> | ObjectRoute<AdditionalRouteParams, TLocals> | PathObjectRoutes<AdditionalRouteParams, TLocals>;
type GetHandlerParams = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(params: HandlerParams<TLocals> & AdditionalRouteParams) => Record<string, any>;
type GetErrorHandlerParams = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(params: HandlerParams<TLocals> & AdditionalRouteParams) => Record<string, any>;
type MapResponse = <AdditionalRouteParams extends Record<string, unknown>>(responseObject: ResponseDefinition, routeParams: AdditionalRouteParams) => Record<string, any>;
type Plugin = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(config: SimpleExpressConfigForPlugins<AdditionalRouteParams, TLocals>) => {
    getHandlerParams?: GetHandlerParams;
    getErrorHandlerParams?: GetErrorHandlerParams;
    mapResponse?: MapResponse;
};
type SimpleExpressConfig<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = {
    port?: string | number;
    routes?: Routes<AdditionalRouteParams, TLocals>;
    middleware?: Handler<AdditionalRouteParams, TLocals> | Handler<AdditionalRouteParams, TLocals>[];
    errorHandlers?: ErrorHandler<AdditionalRouteParams, TLocals> | ErrorHandler<AdditionalRouteParams, TLocals>[];
    expressMiddleware?: Handler$1[];
    config?: Config;
    routeParams?: AdditionalRouteParams;
    app?: Application | symbol;
    server?: Server | Server$1 | symbol;
    plugins?: Plugin[];
};
type SimpleExpressConfigForPlugins<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = {
    port?: string | number;
    routes?: Routes<AdditionalRouteParams, TLocals>;
    middleware?: Handler<AdditionalRouteParams, TLocals> | Handler<AdditionalRouteParams, TLocals>[];
    errorHandlers?: ErrorHandler<AdditionalRouteParams, TLocals> | ErrorHandler<AdditionalRouteParams, TLocals>[];
    expressMiddleware?: Handler$1[];
    config?: Config;
    routeParams?: AdditionalRouteParams;
    app?: Application | symbol;
    server?: Server | Server$1 | symbol;
    plugins?: Plugin[];
};
type SimpleExpressResult = {
    app: Application;
    server: Server | Server$1;
    stats: ReturnType<typeof getStats>;
};

interface ErrorClass {
    new (name: string): Error;
}
/**
 handleErrors(ErrorClass, ErrorHandler)
 or
 handleErrors(ErrorClass[], ErrorHandler)
 */
type ErrorHandlerTuple<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = [
    errorClass: ErrorClass | ErrorClass[] | undefined | null,
    errorHandler: SingleErrorHandler<AdditionalRouteParams, TLocals>
];
/**
 handleErrors(ErrorHandler)
 */
type SingleErrorHandlerTuple<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = [
    errorHandler: SingleErrorHandler<AdditionalRouteParams, TLocals>
];
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
type MultipleErrorHandlers<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = [
    (ErrorHandlerTuple<AdditionalRouteParams, TLocals> | SingleErrorHandlerTuple<AdditionalRouteParams, TLocals> | SingleErrorHandler<AdditionalRouteParams, TLocals>)[]
];
/**
 handleErrors([
   [ErrorClass1, ErrorHandler1],
   [ErrorClass2, ErrorHandler2],
 ], DefaultErrorHandler)
 */
type MultipleErrorHandlersWithDefault<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = [
    (ErrorHandlerTuple<AdditionalRouteParams, TLocals> | SingleErrorHandlerTuple<AdditionalRouteParams, TLocals> | SingleErrorHandler<AdditionalRouteParams, TLocals>)[],
    SingleErrorHandler<AdditionalRouteParams, TLocals>
];
type HandleErrorArguments<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = ErrorHandlerTuple<AdditionalRouteParams, TLocals> | SingleErrorHandlerTuple<AdditionalRouteParams, TLocals> | MultipleErrorHandlers<AdditionalRouteParams, TLocals> | MultipleErrorHandlersWithDefault<AdditionalRouteParams, TLocals>;
declare const _default: <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(...args: HandleErrorArguments<AdditionalRouteParams, TLocals>) => ((error: Error, handlerParams: Omit<HandlerParams<TLocals>, "params"> & AdditionalRouteParams) => void | ResponseDefinition | Error | Promise<void | ResponseDefinition | Error>)[];

declare const ensureArray: <T>(value: T) => T extends any[] ? T : T[];
declare const simpleExpress: <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>({ port, plugins: rawPlugins, routes, middleware: rawMiddleware, errorHandlers, expressMiddleware, config: userConfig, routeParams, app: userApp, server: userServer, }?: SimpleExpressConfig<AdditionalRouteParams, TLocals>) => Promise<SimpleExpressResult>;
declare const wrapMiddleware: (...middleware: (Handler$1 | Handler$1[])[]) => (({ req, res, next }: HandlerParams<any>) => void)[];

export { type Config, type ErrorHandler, type Handler, type HandlerParams, type Plugin, type Routes, type SimpleExpressConfig, type SimpleExpressConfigForPlugins, type SimpleExpressResult, simpleExpress as default, ensureArray, _default as handleError, wrapMiddleware };
