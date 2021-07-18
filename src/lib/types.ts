import { CorsOptions, CorsOptionsDelegate } from 'cors';
import cookieParser from 'cookie-parser';
import { OptionsJson } from 'body-parser';
import { Request, Response, Handler as ExpressHandler, Application, NextFunction } from 'express';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

export type Config = {
  cors: CorsOptions | CorsOptionsDelegate | false,
  jsonBodyParser: OptionsJson | false,
  cookieParser: Parameters<typeof cookieParser> | false,
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

export type Handler = (handlerParams: HandlerParams & RouteParams) => ResponseDefinition | Promise<ResponseDefinition> | Error | void | Handler[]
export type ErrorHandler = (error: Error, handlerParams: HandlerParams & RouteParams) => ResponseDefinition | Promise<ResponseDefinition> | Error | void | ErrorHandler[]

export type Handlers = {
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
export type MapResponse = (responseObject: ResponseDefinition) => Record<string, any>
export type Plugin = (config: SimpleExpressConfigForPlugins) => {
  getHandlerParams: GetHandlerParams,
  getErrorHandlerParams: GetErrorHandlerParams,
  mapResponse: MapResponse,
};

export type SimpleExpressConfig = {
  port?: string | number;
  routes?: Routes[];
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
  routes?: Routes[];
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
