import http, { Server } from 'http';
import { Server as Server$1 } from 'https';
import express, { Request, NextFunction, Response, Handler as Handler$1, Application } from 'express';
import { CorsOptions, CorsOptionsDelegate } from 'cors';
import cookieParser from 'cookie-parser';
import { OptionsJson } from 'body-parser';

type Config = {
    cors: CorsOptions | CorsOptionsDelegate | false;
    jsonBodyParser: OptionsJson | false;
    cookieParser: [secret?: string | string[], options?: cookieParser.CookieParseOptions] | false;
};
type RouteParams = {
    [paramName: string]: any;
};
type HandlerParams = {
    body: any;
    query: any;
    params: any;
    method: string;
    originalUrl: string;
    protocol: string;
    xhr: boolean;
    getHeader: Request['get'];
    get: Request['get'];
    locals: Record<string, any>;
    next: NextFunction;
    req: Request & {
        requestTiming?: number;
    };
    res: Response;
};
type Headers = {
    [headerName: string]: string;
};
type ResponseDefinition = {
    body?: string | Record<string, any> | Buffer;
    status?: number;
    method?: string;
    redirect?: false | string;
    headers?: Headers;
    type?: string;
};
type Handler = (handlerParams: HandlerParams & RouteParams) => ResponseDefinition | Promise<ResponseDefinition> | Error | void;
type ErrorHandler = (error: Error, handlerParams: Omit<HandlerParams & RouteParams, 'params'>) => ResponseDefinition | Promise<ResponseDefinition> | Error | void | ErrorHandler[];
type Handlers = {
    use?: Handler | Handler[];
    get?: Handler | Handler[];
    post?: Handler | Handler[];
    put?: Handler | Handler[];
    delete?: Handler | Handler[];
    del?: Handler | Handler[];
    options?: Handler | Handler[];
    patch?: Handler | Handler[];
    head?: Handler | Handler[];
    checkout?: Handler | Handler[];
    copy?: Handler | Handler[];
    lock?: Handler | Handler[];
    merge?: Handler | Handler[];
    mkactivity?: Handler | Handler[];
    mkcol?: Handler | Handler[];
    move?: Handler | Handler[];
    'm-search'?: Handler | Handler[];
    notify?: Handler | Handler[];
    purge?: Handler | Handler[];
    report?: Handler | Handler[];
    search?: Handler | Handler[];
    subscribe?: Handler | Handler[];
    trace?: Handler | Handler[];
    unlock?: Handler | Handler[];
    unsubscribe?: Handler | Handler[];
};
type PathObjectRoutes = {
    [path: string]: (Handler | Handlers | PathObjectRoutes | PathObjectRoutes[] | Routes) | PathObjectRoutes[];
};
type ObjectRoute = {
    path: string;
    handlers?: Handlers;
    routes?: Routes;
};
type ArrayOfArraysRest = Routes | Handlers | Handler | Handler[] | ArrayOfArrays | ArrayOfArraysRest[];
type ArrayOfArrays = [string, ...ArrayOfArraysRest[]];
type Routes = ArrayOfArrays | PathObjectRoutes | ObjectRoute | Routes[];
type GetHandlerParams = (params: HandlerParams & RouteParams) => Record<string, any>;
type GetErrorHandlerParams = (params: HandlerParams & RouteParams) => Record<string, any>;
type MapResponse = (responseObject: ResponseDefinition, routeParams: RouteParams) => Record<string, any>;
type Plugin = (config: SimpleExpressConfigForPlugins) => {
    getHandlerParams?: GetHandlerParams;
    getErrorHandlerParams?: GetErrorHandlerParams;
    mapResponse?: MapResponse;
};
type SimpleExpressConfig = {
    port?: string | number;
    routes?: Routes;
    middleware?: Handler | Handler[];
    middlewares?: Handler | Handler[];
    globalMiddlewares?: Handler | Handler[];
    simpleExpressMiddlewares?: Handler | Handler[];
    errorHandlers?: ErrorHandler | ErrorHandler[];
    expressMiddleware?: Handler$1[];
    expressMiddlewares?: Handler$1[];
    config?: Config;
    routeParams?: RouteParams;
    app?: Application | symbol;
    server?: Server | Server$1 | symbol;
    plugins?: Plugin[];
};
type SimpleExpressConfigForPlugins = {
    port?: string | number;
    routes?: Routes;
    middleware?: Handler | Handler[];
    errorHandlers?: ErrorHandler | ErrorHandler[];
    expressMiddleware?: Handler$1[];
    config?: Config;
    routeParams?: RouteParams;
    app?: Application | symbol;
    server?: Server | Server$1 | symbol;
    plugins?: Plugin[];
};

interface ErrorClass {
    new (name: string): Error;
}
type ErrorHandlerTuple = [errorClass: ErrorClass | ErrorClass[], errorHandler: ErrorHandler];
type HandlerTuple = [errorHandler: ErrorHandler];
type HandleErrorList = [...ErrorHandlerTuple[], HandlerTuple | ErrorHandler] | ErrorHandlerTuple[];
type HandleErrorArguments = ErrorHandlerTuple | HandlerTuple | [HandleErrorList];
declare const _default: (...args: HandleErrorArguments) => ((error: Error, handlerParams: Omit<HandlerParams, "params">) => void | Error | ErrorHandler[] | ResponseDefinition | Promise<ResponseDefinition>)[];

declare class ValidationError extends Error {
    constructor(errors: any[]);
    errors: any[];
}
declare const ensureArray: <T>(value: T) => T extends any[] ? T : T[];
declare const simpleExpress: ({ port, plugins: rawPlugins, routes, middleware: rawMiddleware, errorHandlers, expressMiddleware, config: userConfig, routeParams, app: userApp, server: userServer, }?: SimpleExpressConfig) => Promise<{
    app: express.Application & {
        server: Server | Server$1;
    };
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> | Server$1<typeof http.IncomingMessage, typeof http.ServerResponse>;
    stats: {
        set: (field: any, number?: number) => number;
        add: (field: any, number?: number) => number;
        getCounter: (field: any) => number;
        registerEvent: (eventName: any, data: any) => void;
        getEvents: (eventName: any) => any;
        logStartup: () => any;
    };
}>;
declare const wrapMiddleware: (...middleware: Handler$1[]) => (({ req, res, next }: HandlerParams) => void)[];

export { ValidationError, simpleExpress as default, ensureArray, _default as handleError, wrapMiddleware };
