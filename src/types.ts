import { CorsOptions, CorsOptionsDelegate } from 'cors';
import cookieParser from 'cookie-parser';
import { OptionsJson } from 'body-parser';
import { Request, Response, Handler as ExpressHandler, Application, NextFunction } from 'express';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { getStats } from './stats';

export type RequestObject = Request & { requestTiming?: number };

export type Config = {
  cors: CorsOptions | CorsOptionsDelegate | false,
  jsonBodyParser: OptionsJson | false,
  cookieParser: [secret?: string | string[], options?: cookieParser.CookieParseOptions] | false,
}

export type HandlerParams<TLocals extends Record<string, unknown> = Record<string, any>> = {
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
  req: Request & { requestTiming?: number },
  res: Response,
}

export type Headers = {
  [headerName: string]: string
}

export type ResponseDefinition = {
  body?: string | object | Buffer;
  status?: number;
  method?: string;
  redirect?: false | string;
  headers?: Headers;
  type?: string;
}

export type Handler<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = (
    handlerParams: HandlerParams<TLocals> & AdditionalRouteParams
  ) =>
    | ResponseDefinition
    | Promise<ResponseDefinition>
    | Error
    | Promise<Error>
    | void
    | Promise<void>
    | Promise<void | ResponseDefinition | Error>;
export type ErrorHandler<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = (
    error: Error | any,
    handlerParams: Omit<HandlerParams<TLocals>, 'params'> & AdditionalRouteParams
  ) =>
    | ResponseDefinition
    | Promise<ResponseDefinition>
    | Error
    | Promise<Error>
    | void
    | Promise<void>
    | Promise<void | ResponseDefinition | Error>;

export type HttpMethod =  'use' | 'get' | 'post' | 'put' | 'delete' | 'del' | 'options' | 'patch' | 'head' | 'checkout' | 'copy' | 'lock' | 'merge' | 'mkactivity' | 'mkcol' | 'move' | 'm-search' | 'notify' | 'purge' | 'report' | 'search' | 'subscribe' | 'trace' | 'unlock' | 'unsubscribe';
export type Handlers<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = Record<HttpMethod, Handler<AdditionalRouteParams, TLocals>>

export type PathObjectRoutes<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = {
  [path: string]:
    | Handler<AdditionalRouteParams, TLocals>
    | Handlers<AdditionalRouteParams, TLocals>
    | PathObjectRoutes<AdditionalRouteParams, TLocals>
    | PathObjectRoutes<AdditionalRouteParams, TLocals>[]
    | Routes<AdditionalRouteParams, TLocals>;
}

export type ObjectRoute<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = {
  path: string;
  handlers?: Handlers<AdditionalRouteParams, TLocals>;
  routes?: Routes<AdditionalRouteParams, TLocals>;
}

export type ArrayOfArraysRest<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> =
  | Routes<AdditionalRouteParams, TLocals>
  | Handlers<AdditionalRouteParams, TLocals>
  | Handler<AdditionalRouteParams, TLocals>
  | Handler<AdditionalRouteParams, TLocals>[]
  | ArrayOfArrays<AdditionalRouteParams, TLocals>
  | ArrayOfArraysRest<AdditionalRouteParams, TLocals>[];

export type ArrayOfArrays<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> =
  [string, ...ArrayOfArraysRest<AdditionalRouteParams, TLocals>[]];

export type Routes<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> =
  | ArrayOfArrays<AdditionalRouteParams, TLocals>
  | PathObjectRoutes<AdditionalRouteParams, TLocals>
  | ObjectRoute<AdditionalRouteParams, TLocals>
  | Routes<AdditionalRouteParams, TLocals>[];

export type GetHandlerParams = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(params: HandlerParams<TLocals> & AdditionalRouteParams) => Record<string, any>
export type GetErrorHandlerParams = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(params: HandlerParams<TLocals> & AdditionalRouteParams) => Record<string, any>
export type MapResponse = <AdditionalRouteParams extends Record<string, unknown>>(responseObject: ResponseDefinition, routeParams: AdditionalRouteParams) => Record<string, any>
export type Plugin = <AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>>(config: SimpleExpressConfigForPlugins<AdditionalRouteParams, TLocals>) => {
  getHandlerParams?: GetHandlerParams,
  getErrorHandlerParams?: GetErrorHandlerParams,
  mapResponse?: MapResponse,
};

export type SimpleExpressConfig<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = {
  port?: string | number;
  routes?: Routes<AdditionalRouteParams, TLocals>;
  middleware?: Handler<AdditionalRouteParams, TLocals> | Handler<AdditionalRouteParams, TLocals>[];
  errorHandlers?: ErrorHandler<AdditionalRouteParams, TLocals> | ErrorHandler<AdditionalRouteParams, TLocals>[];
  expressMiddleware?: ExpressHandler[];
  config?: Config;
  routeParams?: AdditionalRouteParams;
  app?: Application | symbol;
  server?: HttpServer | HttpsServer | symbol;
  plugins?: Plugin[],
}


export type SimpleExpressConfigForPlugins<AdditionalRouteParams extends Record<string, unknown>, TLocals extends Record<string, unknown>> = {
  port?: string | number;
  routes?: Routes<AdditionalRouteParams, TLocals>;
  middleware?: Handler<AdditionalRouteParams, TLocals> | Handler<AdditionalRouteParams, TLocals>[];
  errorHandlers?: ErrorHandler<AdditionalRouteParams, TLocals> | ErrorHandler<AdditionalRouteParams, TLocals>[];
  expressMiddleware?: ExpressHandler[];
  config?: Config;
  routeParams?: AdditionalRouteParams;
  app?: Application | symbol;
  server?: HttpServer | HttpsServer | symbol;
  plugins?: Plugin[],
};

export type SimpleExpressResult = {
  app: Application;
  server: HttpServer | HttpsServer;
  stats: ReturnType<typeof getStats>;
}
