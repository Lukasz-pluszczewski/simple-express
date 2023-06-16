import type cors from 'cors';
import type bodyParser from 'body-parser';
import type cookieParser from 'cookie-parser';

import type express from 'express';
import type http from 'http';
import type https from 'https';

export type Config = {
  cors: cors.CorsOptions | cors.CorsOptionsDelegate;
  jsonBodyParser: bodyParser.OptionsJson;
  cookieParser: cookieParser.CookieParseOptions;
}

export type HandlerParams = {
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

export type Headers = {
  [headerName: string]: string;
};

export type ResponseDefinition = {
  body?: string | object | Buffer;
  status?: number;
  method?: string;
  redirect?: false | string;
  headers?: Headers;
  type?: string;
}

export type Handler<AdditionalRouteParams extends Record<string, unknown>> = (
  handlerParams: HandlerParams & AdditionalRouteParams
) =>
  | ResponseDefinition
  | Promise<ResponseDefinition>
  | Error
  | void
  | Promise<void>
  | Handler<AdditionalRouteParams>[];
export type ErrorHandler<AdditionalRouteParams extends Record<string, unknown>> = (
  error: Error | any,
  handlerParams: HandlerParams & AdditionalRouteParams
) =>
  | ResponseDefinition
  | Promise<ResponseDefinition>
  | Error
  | void
  | Promise<void>
  | ErrorHandler<AdditionalRouteParams>[];

export type HttpMethod =  'use' | 'get' | 'post' | 'put' | 'delete' | 'del' | 'options' | 'patch' | 'head' | 'checkout' | 'copy' | 'lock' | 'merge' | 'mkactivity' | 'mkcol' | 'move' | 'm-search' | 'notify' | 'purge' | 'report' | 'search' | 'subscribe' | 'trace' | 'unlock' | 'unsubscribe';
export type Handlers<AdditionalRouteParams extends Record<string, unknown>> = Record<HttpMethod, Handler<AdditionalRouteParams>>

export type PathObjectRoutes<AdditionalRouteParams extends Record<string, unknown>> = {
  [path: string]:
    | Handler<AdditionalRouteParams>
    | Handlers<AdditionalRouteParams>
    | PathObjectRoutes<AdditionalRouteParams>
    | PathObjectRoutes<AdditionalRouteParams>[]
    | Routes<AdditionalRouteParams>;
}

export type ObjectRoute<AdditionalRouteParams extends Record<string, unknown>> = {
  path: string;
  handlers?: Handlers<AdditionalRouteParams>;
  routes?: Routes<AdditionalRouteParams>;
}

export type ArrayOfArraysRest<AdditionalRouteParams extends Record<string, unknown>> =
  | Routes<AdditionalRouteParams>
  | Handlers<AdditionalRouteParams>
  | Handler<AdditionalRouteParams>
  | Handler<AdditionalRouteParams>[]
  | ArrayOfArrays<AdditionalRouteParams>
  | ArrayOfArraysRest<AdditionalRouteParams>[];

export type ArrayOfArrays<AdditionalRouteParams extends Record<string, unknown>> =
  [string, ...ArrayOfArraysRest<AdditionalRouteParams>[]];

export type Routes<AdditionalRouteParams extends Record<string, unknown>> =
  | ArrayOfArrays<AdditionalRouteParams>
  | PathObjectRoutes<AdditionalRouteParams>
  | ObjectRoute<AdditionalRouteParams>
  | Routes<AdditionalRouteParams>[];

export type SimpleExpressConfig<AdditionalRouteParams extends Record<string, unknown>> = {
  port?: string | number;
  routes?: Routes<AdditionalRouteParams>;
  middleware?: Handler<AdditionalRouteParams> | Handler<AdditionalRouteParams>[];
  errorHandlers?: ErrorHandler<AdditionalRouteParams> | ErrorHandler<AdditionalRouteParams>[];
  expressMiddleware?: express.Handler[];
  config?: Config;
  routeParams?: AdditionalRouteParams;
  app?: express.Application;
  server?: http.Server | https.Server;
}

export type SimpleExpressResult = {
  app: express.Application;
  server: http.Server | https.Server;
}

declare module 'simple-express-framework' {
  export default function simpleExpress<AdditionalRouteParams extends Record<string, unknown>>(
    simpleExpressConfig: SimpleExpressConfig<AdditionalRouteParams>
  ): Promise<SimpleExpressResult>;
}
