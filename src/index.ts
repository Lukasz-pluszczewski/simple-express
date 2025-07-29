import _ from 'lodash';
import http, { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import express, { Handler as ExpressHandler, Application as ExpressApplication } from 'express';

import { log } from './log';
import { getStats } from './stats';
import buildRoutes from './buildRoutes';
import { createErrorHandler, createHandler } from './handler/createHandler';
import handleError from './handleErrors';
import { defaultAppValue, defaultServerValue } from './constants';

import {
  SimpleExpressConfig,
  SimpleExpressConfigForPlugins,
  Config,
  HandlerParams,
  SimpleExpressResult,
} from './types';
import { createGetGlobalContext, createGetRequestContext, GlobalContextContainer } from './handler/context';
import { AsyncLocalStorage } from 'node:async_hooks';

export type {
  Routes,
  Handler,
  ErrorHandler,
  Plugin,
  SimpleExpressConfig,
  SimpleExpressConfigForPlugins,
  Config,
  HandlerParams,
  SimpleExpressResult,
} from './types';


export const ensureArray = <T>(value: T): T extends any[] ? T : T[] =>
  (Array.isArray(value) ? value : [value]) as T extends any[] ? T : T[];

const getDefaultConfig = (
  userConfig: Config,
  defaultConfig: Config = {
    cors: null,
    jsonBodyParser: null,
    cookieParser: [],
    helmet: null,
  }
) => {
  if (!userConfig) {
    return defaultConfig;
  }

  const {
    cors = defaultConfig.cors,
    jsonBodyParser = defaultConfig.jsonBodyParser,
    cookieParser = defaultConfig.cookieParser,
  } = userConfig;

  return {
    cors,
    jsonBodyParser,
    cookieParser,
  };
};

let getRequestContext;
let getGlobalContext;

const simpleExpress = async <
  AdditionalRouteParams extends Record<string, unknown> = Record<string, never>,
  TLocals extends Record<string, unknown> = Record<string, never>,
  TRequestContext extends Record<string, unknown> = Record<string, never>,
  TGlobalContext extends Record<string, unknown> = Record<string, never>
>({
  port,
  plugins: rawPlugins = [],
  requestContext: requestContextConfig,
  globalContext: globalContextConfig,
  routes = [],
  middleware: rawMiddleware = [],
  errorHandlers = [],
  expressMiddleware = [],
  config: userConfig,
  routeParams = {} as any,
  app: userApp = defaultAppValue,
  server: userServer = defaultServerValue,
}: SimpleExpressConfig<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> = {}): Promise<SimpleExpressResult<TRequestContext, TGlobalContext>> => {
  if (port) {
    log(`Initializing simpleExpress app on port ${port}...`);
  } else {
    log(`Initializing simpleExpress app (no port)...`);
  }
  // validate config
  let middleware = ensureArray(rawMiddleware);

  // simpleExpress config for plugins
  const simpleExpressConfigForPlugins: SimpleExpressConfigForPlugins<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext> = {
    port,
    plugins: rawPlugins,
    routes,
    middleware,
    errorHandlers,
    expressMiddleware,
    config: userConfig,
    routeParams,
    app: userApp,
    server: userServer,
  };

  // preparePlugins
  const plugins = rawPlugins.map((plugin) =>
    plugin(simpleExpressConfigForPlugins)
  );

  // create stats
  const stats = getStats(port);

  // creating express app
  const app = (userApp === defaultAppValue ? express() : userApp) as
    ExpressApplication & { server: HttpServer | HttpsServer };
  const server = (userServer === defaultServerValue ? http.createServer(app) : userServer) as
    HttpServer | HttpsServer;
  app.server = server;

  // applying default middlewares
  const config = getDefaultConfig(userConfig);

  if (config.cors !== false) {
    try {
      const cors = require('cors');
      stats.set('cors');
      app.use(cors(config.cors));
    } catch (error) {
      stats.set('cors-not-found');
    }
  }

  if (config.jsonBodyParser !== false) {
    try {
      const bodyParser = require('body-parser');
      stats.set('jsonBodyParser');
      app.use(bodyParser.json(config.jsonBodyParser));
    } catch (error) {
      stats.set('jsonBodyParser-not-found');
    }
  }

  if (config.cookieParser !== false) {
    try {
      const cookieParser = require('cookie-parser');
      stats.set('cookieParser');
      app.use(cookieParser(config.cookieParser[0], config.cookieParser[1]));
    } catch (error) {
      stats.set('cookieParser-not-found');
    }
  }

  if (config.helmet !== false) {
    try {
      const helmet = require('helmet');
      stats.set('helmet');
      app.use(helmet(config.helmet));
    } catch (error) {
      stats.set('helmet-not-found');
    }
  }

  const requestContextLocalStorage = new AsyncLocalStorage<TRequestContext>();
  const globalContextLocalStorage = new AsyncLocalStorage<TGlobalContext>();

  getRequestContext = createGetRequestContext(requestContextLocalStorage);
  getGlobalContext = createGetGlobalContext(globalContextLocalStorage);

  const globalContextContainer = (globalContextConfig === false || globalContextConfig === undefined) ? undefined : GlobalContextContainer(globalContextLocalStorage, { ...globalContextConfig });

  const createHandlerWithParams = createHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>({ additionalParams: routeParams, plugins, requestContextConfig, globalContextContainer, requestContextLocalStorage });
  const createErrorHandlerWithParams = createErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>({ additionalParams: routeParams, plugins, requestContextConfig, globalContextContainer, requestContextLocalStorage });

  // applying custom express middlewares
  const expressMiddlewareFlat = _.flattenDeep(expressMiddleware) as ExpressHandler[];
  stats.set('expressMiddleware', expressMiddlewareFlat.length);
  expressMiddlewareFlat.forEach((middleware) => app.use(middleware));

  // applying middlewares
  const middlewareFlat = _.flattenDeep(middleware);
  stats.set('middleware', middlewareFlat.length);
  middlewareFlat.forEach((middleware) => {
    app.use(createHandlerWithParams(middleware));
  });

  // applying routes
  app.use(
    buildRoutes({
      stats,
      createHandlerWithParams,
    })(routes)
  );

  // applying error handlers
  const errorHandlersFlat = _.flattenDeep(ensureArray(errorHandlers));
  stats.set('errorHandlers', errorHandlersFlat.length);
  errorHandlersFlat.forEach((errorHandler) => {
    app.use(createErrorHandlerWithParams(errorHandler));
  });

  // starting server
  if (port) {
    app.server.listen(typeof port === 'number' ? port : parseInt(port, 10));
  }

  const serverAddress = app.server.address();

  if (port && !serverAddress) {
    log(
      `ERROR: App started but app.server.address() is undefined. It seems that the ${port} port is already used.`
    );
    throw new Error(
      `App started but it doesn't seem to listen on any port. Check if port ${port} is not already used.`
    );
  }

  stats.logStartup();
  if (port) {
    log(`App is listening on port ${port}`);
  } else {
    log(`App started. Not listening on any port.`);
  }

  const { port: serverPort, address } = (() => {
    if (!port) {
      return { port: undefined, address: null };
    }
    if (typeof serverAddress === 'string') {
      return { port: undefined, address: serverAddress };
    }
    return { port: serverAddress.port, address: serverAddress };
  })();

  return { app, server, stats, port: serverPort, address, getRequestContext, getGlobalContext };
};

export const wrapMiddleware = (...middleware: (ExpressHandler | ExpressHandler[])[]) =>
  _.flattenDeep(middleware).map((el) => ({ req, res, next }: HandlerParams<any>) => {
    el(req, res, next);
  });

export { handleError, getRequestContext, getGlobalContext };

export default simpleExpress;
