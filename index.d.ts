import cors = require('cors');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');

import express = require('express');
import http = require('http');
import https = require('https');

declare module "./src/lib" {
    interface IConfig {
        cors: cors.CorsOptions | cors.CorsOptionsDelegate,
        jsonBodyParser: bodyParser.OptionsJson,
        cookieParser: cookieParser.CookieParseOptions,
    }

    interface IRouteParams {
        [paramNam: string]: any,
    }

    interface IHandlerParams {
        body: any;
        query: any;
        params: any;
        method: string;
        originalUrl: string;
        protocol: string;
        xhr: boolean;
        getHeader: (x: string) => string;
        get: (x: string) => string;
        locals: object;
        next: (error?: any) => void;
        req: express.Request;
        res: express.Response;
    }

    interface IHeaders {
        [headerName: string]: string
    }

    interface IResponseDefinition {
        body?: string | object | Buffer,
        status?: number;
        method?: string;
        redirect?: false | string;
        headers?: IHeaders;
        type?: string;
    }

    type Handler = (handlerParams: IHandlerParams & IRouteParams) => IResponseDefinition | Promise<IResponseDefinition> | Error | void | Handler[]
    type ErrorHandler = (error: Error, handlerParams: IHandlerParams & IRouteParams) => IResponseDefinition | Promise<IResponseDefinition> | Error | void | ErrorHandler[]

    interface IHandlers {
        use?: Handler;

        get?: Handler;
        post?: Handler;
        put?: Handler;
        delete?: Handler;
        del?: Handler;
        options?: Handler;
        patch?: Handler;
        head?: Handler;

        checkout?: Handler;
        copy?: Handler;
        lock?: Handler;
        merge?: Handler;
        mkactivity?: Handler;
        mkcol?: Handler;
        move?: Handler;
        'm-search'?: Handler,
        notify?: Handler;
        purge?: Handler;
        report?: Handler;
        search?: Handler;
        subscribe?: Handler;
        trace?: Handler;
        unlock?: Handler;
        unsubscribe?: Handler;
    }

    interface IPathObjectRoutes {
        [path: string]:
            | (Handler | IHandlers | IPathObjectRoutes | IPathObjectRoutes[] | Routes)
            | IPathObjectRoutes[];
    }

    interface IObjectRoute {
        path: string;
        handlers?: IHandlers;
        routes?: Routes;
    }

    type ArrayOfArraysRest =
        | Routes
        | IHandlers
        | Handler
        | Handler[]
        | ArrayOfArrays
        | ArrayOfArraysRest[];

    type ArrayOfArrays = [string, ...ArrayOfArraysRest[]];

    type Routes = ArrayOfArrays | IPathObjectRoutes | IObjectRoute | Routes[];

    interface ISimpleExpressConfig {
        port?: string | number;
        routes?: Routes[];
        middleware?: Handler | Handler[];
        errorHandlers?: ErrorHandler | ErrorHandler[];
        expressMiddleware?: express.Handler[];
        config?: IConfig;
        routeParams?: IRouteParams;
        app?: express.Application;
        server?: http.Server | https.Server;
    }

    interface ISimpleExpressResult {
        app: express.Application;
        server: http.Server | https.Server;
    }

    type simpleExpress = (simpleExpressConfig: ISimpleExpressConfig) => Promise<ISimpleExpressResult>

    export default simpleExpress
}
