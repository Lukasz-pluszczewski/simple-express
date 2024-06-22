import { CorsOptions, CorsOptionsDelegate } from 'cors';
import cookieParser from 'cookie-parser';
import { OptionsJson } from 'body-parser';
import { Request, Response, Handler as ExpressHandler, Application, NextFunction } from 'express';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

export type RecursiveArray<T> = Array<T|RecursiveArray<T>>

export type RequestObject = Request & { requestTiming?: number };

export type Config = {
  cors: CorsOptions | CorsOptionsDelegate | false,
  jsonBodyParser: OptionsJson | false,
  cookieParser: [secret?: string | string[], options?: cookieParser.CookieParseOptions] | false,
}

export type RouteParams = {
  [paramName: string]: any,
}

export type HandlerParams = {
  body: any,
  query: any,
  params: any,
  method: string,
  originalUrl: string,
  protocol: string,
  xhr: boolean,
  getHeader: Request['get'],
  get: Request['get'],
  locals: Record<string, any>,
  next: NextFunction,
  req: Request & { requestTiming?: number },
  res: Response,
}

export type Headers = {
  [headerName: string]: string
}

export type ResponseDefinition = {
  body?: string | Record<string, any> | Buffer,
  status?: number,
  method?: string,
  redirect?: false | string,
  headers?: Headers,
  type?: string,
}

export type Handler = (handlerParams: HandlerParams & RouteParams) => ResponseDefinition | Promise<ResponseDefinition> | Error | void;
export type ErrorHandler = (error: Error, handlerParams: Omit<HandlerParams & RouteParams, 'params'>) => ResponseDefinition | Promise<ResponseDefinition> | Error | void | ErrorHandler[]

export type Handlers = {
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
}

export type PathObjectRoutes = {
  [path: string]:
    | (Handler | Handlers | PathObjectRoutes | PathObjectRoutes[] | Routes)
    | PathObjectRoutes[];
};

export type ObjectRoute = {
  path: string;
  handlers?: Handlers;
  routes?: Routes;
}

export type ArrayOfArraysRest =
  | Routes
  | Handlers
  | Handler
  | Handler[]
  | ArrayOfArrays
  | ArrayOfArraysRest[];

export type ArrayOfArrays = [string, ...ArrayOfArraysRest[]];

export type Routes = ArrayOfArrays | PathObjectRoutes | ObjectRoute | Routes[];

export type GetHandlerParams = (params: HandlerParams & RouteParams) => Record<string, any>
export type GetErrorHandlerParams = (params: HandlerParams & RouteParams) => Record<string, any>
export type MapResponse = (responseObject: ResponseDefinition, routeParams: RouteParams) => Record<string, any>
export type Plugin = (config: SimpleExpressConfigForPlugins) => {
  getHandlerParams?: GetHandlerParams,
  getErrorHandlerParams?: GetErrorHandlerParams,
  mapResponse?: MapResponse,
};

export type SimpleExpressConfig = {
  port?: string | number;
  routes?: Routes;
  middleware?: Handler | Handler[];
  middlewares?: Handler | Handler[];
  globalMiddlewares?: Handler | Handler[];
  simpleExpressMiddlewares?: Handler | Handler[];
  errorHandlers?: ErrorHandler | ErrorHandler[];
  expressMiddleware?: ExpressHandler[];
  expressMiddlewares?: ExpressHandler[];
  config?: Config;
  routeParams?: RouteParams;
  app?: Application | symbol;
  server?: HttpServer | HttpsServer | symbol;
  plugins?: Plugin[],
}

export type SimpleExpressConfigForPlugins = {
  port?: string | number;
  routes?: Routes;
  middleware?: Handler | Handler[];
  errorHandlers?: ErrorHandler | ErrorHandler[];
  expressMiddleware?: ExpressHandler[];
  config?: Config;
  routeParams?: RouteParams;
  app?: Application | symbol;
  server?: HttpServer | HttpsServer | symbol;
  plugins?: Plugin[],
}

export type SimpleExpressResult = {
  app: Application;
  server: HttpServer | HttpsServer;
}

export type simpleExpress = (simpleExpressConfig: SimpleExpressConfig) => Promise<SimpleExpressResult>

export type SimpleExpressHelper = {
  runRoute: (label: string, method: string, data: Record<string, any>) => Promise<ResponseDefinition>
  getRoutes: () => Routes[]
};
