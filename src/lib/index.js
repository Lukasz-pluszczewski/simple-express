import "regenerator-runtime/runtime";
import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import _ from 'lodash';

import log from './log';
import getStats from './stats';
import buildRoutes from './buildRoutes';
import { createHandler, createErrorHandler } from './createHandler';
import propTypesMiddleware from './propTypesMiddleware';
import handleError from './handleError.js';

export const checkPropTypes = propTypesMiddleware;

const defaultAppValue = Symbol('defaultAppValue');
const defaultServerValue = Symbol('defaultServerValue');

export class ValidationError extends Error {
  constructor(errors) {
    super();
    this.errors = errors;
  }
}

const getDefaultConfig = (userConfig, defaultConfig = {
  cors: null,
  jsonBodyParser: null,
  cookieParser: [],
}) => {
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

const createSimpleExpressHelper = ({ routes, routeParams }) => {
  return {
    runRoute: async(label, method, data) => {
      if (!Array.isArray(routes)) {
        log.warning(`Only "array of objects" style routes are supported by runRoute helper`);
        return Promise.reject();
      }
      const route = _.find(routes, route => {
        if (Array.isArray(route)) {
          log.warning(`Only "array of objects" style routes are supported by runRoute helper`);
          return Promise.reject();
        }
      });
      if (!route) {
        return Promise.reject();
      }

      const handler = _.get(route, ['handler', method]);
      if (!handler) {
        return Promise.reject();
      }

      return handler({ ...routeParams, ...data });
    },
    getRoutes: () => routes,
  };
};


const simpleExpress = async({
  port,
  plugins: rawPlugins = [],
  routes = [],
  middleware = [],
  middlewares, // TODO remove in 3.0.0
  simpleExpressMiddlewares, // TODO remove in 3.0.0
  globalMiddlewares, // TODO remove in 3.0.0
  errorHandlers = [],
  expressMiddlewares, // TODO remove in 3.0.0
  expressMiddleware = [],
  config: userConfig,
  routeParams = {},
  app: userApp = defaultAppValue,
  server: userServer = defaultServerValue,
} = {}) => {
  if (port) {
    log(`Initializing simpleExpress app on port ${port}...`);
  } else {
    log(`Initializing simpleExpress app (no port)...`);
  }
  // validate config
  if (globalMiddlewares) {
    log.warning('"globalMiddlewares" option is deprecated. Use "middleware" option.');
    middleware = [...middleware, ...globalMiddlewares];
  }
  if (simpleExpressMiddlewares) {
    log.warning('"simpleExpressMiddlewares" option is deprecated. Use "middleware" option.');
    middleware = [...middleware, ...simpleExpressMiddlewares];
  }
  if (middlewares) {
    log.warning('"middlewares" option is deprecated. Use "middleware" (without "s") option.');
    middleware = [...middleware, ...middlewares];
  }
  if (expressMiddlewares) {
    log.warning('"expressMiddlewares" option is deprecated. Use "expressMiddleware" (without "s") option.');
    expressMiddleware = [...expressMiddleware, ...expressMiddlewares];
  }

  // simpleExpress config for plugins
  const simpleExpressConfigForPlugins = {
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
  const plugins = rawPlugins.map(plugin => plugin(simpleExpressConfigForPlugins))

  // create stats
  const stats = getStats(port);

  // creating express app
  const app = userApp === defaultAppValue ? express() : userApp;
  const server = userServer === defaultServerValue ? http.createServer(app) : userServer;
  app.server = server;

  // creating simpleExpress helper utility
  const simpleExpressHelper = await createSimpleExpressHelper({ routes, routeParams });

  // applying default middlewares
  const config = getDefaultConfig(userConfig);

  if (config.cors !== false) {
    stats.set('cors');
    app.use(cors(config.cors));
  }

  if (config.jsonBodyParser !== false) {
    stats.set('jsonBodyParser');
    app.use(bodyParser.json(config.jsonBodyParser));
  }

  if (config.cookieParser !== false) {
    stats.set('cookieParser');
    app.use(cookieParser(config.cookieParser));
  }

  const createHandlerWithParams = createHandler({ additionalParams: routeParams, plugins }, simpleExpressHelper);
  const createErrorHandlerWithParams = createErrorHandler({ additionalParams: routeParams, plugins }, simpleExpressHelper);

  // applying custom express middlewares
  const expressMiddlewareFlat = _.flattenDeep(expressMiddleware);
  stats.set('expressMiddleware', expressMiddlewareFlat.length);
  expressMiddlewareFlat.forEach(middleware => app.use(middleware));

  // applying middlewares
  const middlewareFlat = _.flattenDeep(middleware);
  stats.set('middleware', middlewareFlat.length);
  middlewareFlat.forEach(middleware => {
    app.use(createHandlerWithParams(middleware));
  });

  // applying routes
  app.use(buildRoutes({
    app,
    stats,
    createHandlerWithParams,
  })(routes));

  // applying error handlers
  const errorHandlersFlat = _.flattenDeep(errorHandlers);
  stats.set('errorHandlers', errorHandlersFlat.length);
  errorHandlersFlat.forEach(errorHandler => {
    app.use(createErrorHandlerWithParams(errorHandler));
  });

  // starting actual server
  if (port) {
    app.server.listen(port);
  }

  if (port && !app.server.address()) {
    log(`ERROR: App started but app.server.address() is undefined. It seems that the ${port} port is already used.`);
    throw new Error(`App started but it doesn't seem to listen on any port. Check if port ${port} is not already used.`);
  }

  stats.logStartup();
  if (port) {
    log(`App is listening on port ${port}`);
  } else {
    log(`App started. Not listening on any port.`);
  }

  return { app, server, stats };
};

export const wrapMiddleware = (...middleware) => _.flattenDeep(middleware).map(el => ({ req, res, next }) => {
  el(req, res, next);
});

export { handleError };

export default simpleExpress;
