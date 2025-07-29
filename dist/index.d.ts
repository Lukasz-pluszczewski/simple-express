import { Request, Response, Handler as Handler$1, Express } from 'express';
import { CorsOptions, CorsOptionsDelegate } from 'cors';
import { CookieParseOptions } from 'cookie-parser';
import { OptionsJson } from 'body-parser';
import { HelmetOptions } from 'helmet';
import { AddressInfo } from 'net';
import { Server } from 'http';
import { Server as Server$1 } from 'https';
import { AsyncLocalStorage } from 'node:async_hooks';

declare const getStats: (port: any) => {
    set: (field: any, number?: number) => number;
    add: (field: any, number?: number) => number;
    getCounter: (field: any) => number;
    registerEvent: (eventName: any, data: any) => void;
    getEvents: (eventName: any) => any;
    logStartup: () => any;
};

type Path = string;
type Config = {
    cors?: CorsOptions | CorsOptionsDelegate | false;
    jsonBodyParser?: OptionsJson | false;
    cookieParser?: [secret?: string | string[], options?: CookieParseOptions] | false;
    helmet?: HelmetOptions | false;
};
type ContextContainer<TContext extends Record<string, unknown> = Record<string, never>> = {
    get: <TKey extends keyof TContext>(key: TKey) => TContext[TKey];
    set: <TKey extends keyof TContext>(key: TKey, value: TContext[TKey]) => void;
    nativeLocalStorage: AsyncLocalStorage<TContext>;
    run: <TParams extends unknown[]>(fn: (...params: TParams) => Promise<void>, ...params: TParams) => Promise<void>;
};
type GetContextContainerHelper<TContext extends Record<string, unknown> = Record<string, never>> = () => {
    get: <TKey extends keyof TContext>(key: TKey) => TContext[TKey];
    set: <TKey extends keyof TContext>(key: TKey, value: TContext[TKey]) => void;
    nativeLocalStorage: AsyncLocalStorage<TContext>;
};
type HandlerParams<TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
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
    requestContext: TRequestContext extends false ? TRequestContext extends false ? never : never : ContextContainer<TRequestContext>;
    globalContext: TGlobalContext extends false ? TGlobalContext extends false ? never : never : ContextContainer<TGlobalContext>;
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
type SingleHandler<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = ((handlerParams: HandlerParams<TLocals, TRequestContext, TGlobalContext> & AdditionalRouteParams) => ResponseDefinition | Promise<ResponseDefinition> | Error | Promise<Error> | void | Promise<void> | Promise<void | ResponseDefinition | Error>);
type Handler<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = SingleHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
type SingleErrorHandler<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = (error: Error | any, handlerParams: Omit<HandlerParams<TLocals, TRequestContext, TGlobalContext>, 'params'> & AdditionalRouteParams) => ResponseDefinition | Promise<ResponseDefinition> | Error | Promise<Error> | void | Promise<void> | Promise<void | ResponseDefinition | Error>;
type ErrorHandler<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = SingleErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | ErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
type HttpMethod = 'use' | 'get' | 'post' | 'put' | 'delete' | 'del' | 'options' | 'patch' | 'head' | 'checkout' | 'copy' | 'lock' | 'merge' | 'mkactivity' | 'mkcol' | 'move' | 'm-search' | 'notify' | 'purge' | 'report' | 'search' | 'subscribe' | 'trace' | 'unlock' | 'unsubscribe';
type Handlers<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
    [method in HttpMethod]?: Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
};
type PathObjectRoutes<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
    [path: string]: Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[] | PathObjectRoutes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | PathObjectRoutes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[] | Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>;
};
type ObjectRoute<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
    path: Path;
    handlers?: Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
    routes?: Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>;
};
type ArrayOfArraysRest<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[] | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[] | ArrayOfArrays<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | ArrayOfArraysRest<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
type ArrayOfArrays<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = [
    Path,
    ...ArrayOfArraysRest<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[]
];
type Routes<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = ObjectRoute<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[] | Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[] | ArrayOfArrays<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | ObjectRoute<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | PathObjectRoutes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>;
type GetHandlerParams = <AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>>(params: HandlerParams<TLocals, TRequestContext, TGlobalContext> & AdditionalRouteParams) => Record<string, any>;
type GetErrorHandlerParams = <AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>>(params: HandlerParams<TLocals, TRequestContext, TGlobalContext> & AdditionalRouteParams) => Record<string, any>;
type MapResponse = <AdditionalRouteParams extends Record<string, unknown> = Record<string, never>>(responseObject: ResponseDefinition, routeParams: AdditionalRouteParams) => Record<string, any>;
type Plugin<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = (config: SimpleExpressConfigForPlugins<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>) => {
    getHandlerParams?: GetHandlerParams;
    getErrorHandlerParams?: GetErrorHandlerParams;
    mapResponse?: MapResponse;
};
type RequestContextConfig<RequestContext extends Record<string, unknown> = Record<string, never>, AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>> = (handlerParams: HandlerParams<TLocals> & AdditionalRouteParams) => RequestContext;
type GlobalContextConfig<GlobalContext extends Record<string, unknown> = Record<string, never>> = GlobalContext;
type SimpleExpressConfig<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
    port?: string | number;
    routes?: Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>;
    middleware?: Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
    errorHandlers?: ErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | ErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
    expressMiddleware?: Handler$1[];
    config?: Config;
    routeParams?: AdditionalRouteParams;
    app?: Express | symbol;
    server?: Server | Server$1 | symbol;
    plugins?: Plugin<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
    requestContext?: RequestContextConfig<TRequestContext, AdditionalRouteParams, TLocals> | false;
    globalContext?: GlobalContextConfig<TGlobalContext> | false;
};
type SimpleExpressConfigForPlugins<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
    port?: string | number;
    routes?: Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>;
    middleware?: Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
    errorHandlers?: ErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | ErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
    expressMiddleware?: Handler$1[];
    config?: Config;
    routeParams?: AdditionalRouteParams;
    app?: Express | symbol;
    server?: Server | Server$1 | symbol;
    plugins?: Plugin<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
    requestContext?: RequestContextConfig<TRequestContext, AdditionalRouteParams, TLocals> | false;
    globalContext?: GlobalContextConfig<TGlobalContext> | false;
};
type SimpleExpressResult<TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
    app: Express;
    server: Server | Server$1;
    stats: ReturnType<typeof getStats>;
    port: string | number;
    address: AddressInfo | string | null;
    getRequestContext: GetContextContainerHelper<TRequestContext>;
    getGlobalContext: GetContextContainerHelper<TGlobalContext>;
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
declare let getRequestContext: any;
declare let getGlobalContext: any;
declare const simpleExpress: <AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>>({ port, plugins: rawPlugins, requestContext: requestContextConfig, globalContext: globalContextConfig, routes, middleware: rawMiddleware, errorHandlers, expressMiddleware, config: userConfig, routeParams, app: userApp, server: userServer, }?: SimpleExpressConfig<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>) => Promise<SimpleExpressResult<TRequestContext, TGlobalContext>>;
declare const wrapMiddleware: (...middleware: (Handler$1 | Handler$1[])[]) => (({ req, res, next }: HandlerParams<any>) => void)[];

export { type Config, type ErrorHandler, type Handler, type HandlerParams, type Plugin, type Routes, type SimpleExpressConfig, type SimpleExpressConfigForPlugins, type SimpleExpressResult, simpleExpress as default, ensureArray, getGlobalContext, getRequestContext, _default as handleError, wrapMiddleware };
