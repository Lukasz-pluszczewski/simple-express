import type { CorsOptions, CorsOptionsDelegate } from 'cors';
import type { CookieParseOptions } from 'cookie-parser';
import type { OptionsJson } from 'body-parser';
import type { HelmetOptions } from 'helmet';
import type { AddressInfo } from 'net';
import type { Request, Response, Handler as ExpressHandler, Express } from 'express';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';
import { getStats } from './stats';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface ErrorClass<TError extends Error = Error> {
  new (...args: unknown[]): TError;
}

export type Path = string;

export type RequestObject = Request & { requestTiming?: number };

export type Config = {
  cors?: CorsOptions | CorsOptionsDelegate | false,
  jsonBodyParser?: OptionsJson | false,
  cookieParser?: [secret?: string | string[], options?: CookieParseOptions] | false,
  helmet?: HelmetOptions | false,
}

export type ContextContainer<TContext extends Record<string, unknown> = Record<string, never>> = {
  get: <TKey extends keyof TContext>(key: TKey) => TContext[TKey];
  set: <TKey extends keyof TContext>(key: TKey, value: TContext[TKey]) => void;
  nativeLocalStorage: AsyncLocalStorage<TContext>;
  run: <TParams extends unknown[]>(fn: (...params: TParams) => Promise<void>, ...params: TParams) => Promise<void>;
};

export type GetContextContainerHelper<TContext extends Record<string, unknown> = Record<string, never>> = () => {
  get: <TKey extends keyof TContext>(key: TKey) => TContext[TKey];
  set: <TKey extends keyof TContext>(key: TKey, value: TContext[TKey]) => void;
  nativeLocalStorage: AsyncLocalStorage<TContext>;
};

export type HandlerParams<TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
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
  requestContext: TRequestContext extends false ? TRequestContext extends false ? never : never : ContextContainer<TRequestContext>;
  globalContext: TGlobalContext extends false ? TGlobalContext extends false ? never : never : ContextContainer<TGlobalContext>;
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

export type SingleHandler<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = ((
    handlerParams: HandlerParams<TLocals, TRequestContext, TGlobalContext> & AdditionalRouteParams
  ) =>
    | ResponseDefinition
    | Promise<ResponseDefinition>
    | Error
    | Promise<Error>
    | void
    | Promise<void>
    | Promise<void | ResponseDefinition | Error>);

export type Handler<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> =
  SingleHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
  | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];

export type SingleErrorHandler<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>, TError extends Error = Error> = (
    error: TError,
    handlerParams: Omit<HandlerParams<TLocals, TRequestContext, TGlobalContext>, 'params'> & AdditionalRouteParams
  ) =>
  | ResponseDefinition
  | Promise<ResponseDefinition>
  | Error
  | Promise<Error>
  | void
  | Promise<void>
  | Promise<void | ResponseDefinition | Error>;
export type ErrorHandler<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>, TError extends Error = Error> =
  | SingleErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext, TError>
  | ErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext, TError>[];

export type HttpMethod =  'use' | 'get' | 'post' | 'put' | 'delete' | 'del' | 'options' | 'patch' | 'head' | 'checkout' | 'copy' | 'lock' | 'merge' | 'mkactivity' | 'mkcol' | 'move' | 'm-search' | 'notify' | 'purge' | 'report' | 'search' | 'subscribe' | 'trace' | 'unlock' | 'unsubscribe';
export type Handlers<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
  [method in HttpMethod]?: Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
};

export type PathObjectRoutes<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
  [path: string]:
    | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
    | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
    | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[]
    | PathObjectRoutes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
    | PathObjectRoutes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[]
    | Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>;
}

export type ObjectRoute<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
  path: Path;
  handlers?:
    | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
    | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
  routes?: Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>;
}

export type ArrayOfArraysRest<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> =
  | Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
  | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
  | Handlers<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[]
  | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
  | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[]
  | ArrayOfArrays<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
  | ArrayOfArraysRest<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];

export type ArrayOfArrays<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> =
  [Path, ...ArrayOfArraysRest<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[]];

export type Routes<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> =
  | ObjectRoute<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[]
  | Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[]
  | ArrayOfArrays<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
  | ObjectRoute<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
  | PathObjectRoutes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>;

export type GetHandlerParams = <AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>>(params: HandlerParams<TLocals, TRequestContext, TGlobalContext> & AdditionalRouteParams) => Record<string, any>
export type GetErrorHandlerParams = <AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>>(params: HandlerParams<TLocals, TRequestContext, TGlobalContext> & AdditionalRouteParams) => Record<string, any>
export type MapResponse = <AdditionalRouteParams extends Record<string, unknown> = Record<string, never>>(responseObject: ResponseDefinition, routeParams: AdditionalRouteParams) => Record<string, any>
export type Plugin<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = (config: SimpleExpressConfigForPlugins<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>) => {
  getHandlerParams?: GetHandlerParams,
  getErrorHandlerParams?: GetErrorHandlerParams,
  mapResponse?: MapResponse,
};

export type RequestContextConfig<RequestContext extends Record<string, unknown> = Record<string, never>, AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>> = (handlerParams: HandlerParams<TLocals> & AdditionalRouteParams) => RequestContext;
export type GlobalContextConfig<GlobalContext extends Record<string, unknown> = Record<string, never>> = GlobalContext;

export type SimpleExpressConfig<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
  port?: string | number;
  routes?: Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>;
  middleware?: Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
  errorHandlers?: ErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | ErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
  expressMiddleware?: ExpressHandler[];
  config?: Config;
  routeParams?: AdditionalRouteParams;
  app?: Express | symbol;
  server?: HttpServer | HttpsServer | symbol;
  plugins?: Plugin<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[],
  requestContext?: RequestContextConfig<TRequestContext, AdditionalRouteParams, TLocals> | false;
  globalContext?: GlobalContextConfig<TGlobalContext> | false;
}


export type SimpleExpressConfigForPlugins<AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
  port?: string | number;
  routes?: Routes<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>;
  middleware?: Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | Handler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
  errorHandlers?: ErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> | ErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[];
  expressMiddleware?: ExpressHandler[];
  config?: Config;
  routeParams?: AdditionalRouteParams;
  app?: Express | symbol;
  server?: HttpServer | HttpsServer | symbol;
  plugins?: Plugin<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>[],
  requestContext?: RequestContextConfig<TRequestContext, AdditionalRouteParams, TLocals> | false;
  globalContext?: GlobalContextConfig<TGlobalContext> | false;
};

export type SimpleExpressResult<TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>> = {
  app: Express;
  server: HttpServer | HttpsServer;
  stats: ReturnType<typeof getStats>;
  port: string | number;
  address: AddressInfo | string | null;
  getRequestContext: GetContextContainerHelper<TRequestContext>;
  getGlobalContext: GetContextContainerHelper<TGlobalContext>;
}
