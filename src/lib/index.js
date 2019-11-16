import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import forEach from 'lodash/forEach';
import _ from 'lodash';

import log from './log';
import getStats from './stats';
import { createHandler, createErrorHandler } from './createHandler';
import propTypesMiddleware from './propTypesMiddleware';

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
  cors: {
    origin: true,
    credentials: true,
    exposedHeaders: ['Link', 'Jwt'],
  },
  jsonBodyParser: {
    limit: '300kb',
  },
}) => {
  const config = {};
  if (!config) {
    return defaultConfig;
  }

  const { cors = defaultConfig.cors, jsonBodyParser = defaultConfig.jsonBodyParser } = config;

  return {
    cors,
    jsonBodyParser,
  };
};

const mapMethod = method => method.toLowerCase();

const createSimpleExpressHelper = ({ routes, routeParams }) => {
  return {
    runRoute: async(label, method, data) => {
      const route = _.find(routes, { label });
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
  routes = [],
  simpleExpressMiddlewares = [],
  errorHandlers = [],
  expressMiddlewares = [],
  config: userConfig,
  routeParams = {},
  app: userApp = defaultAppValue,
  server: userServer = defaultServerValue,
}) => {
  log(`Initializing simpleExpress app on port ${port}...`);
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

  if (config.cors) {
    stats.set('cors');
    app.use(cors(config.cors));
  }

  if (config.jsonBodyParser) {
    stats.set('jsonBodyParser');
    app.use(bodyParser.json(config.jsonBodyParser));
  }

  const createHandlerWithParams = createHandler(routeParams, simpleExpressHelper);
  const createErrorHandlerWithParams = createErrorHandler(routeParams, simpleExpressHelper);

  // applying custom express middlewares
  stats.set('expressMiddlewares', expressMiddlewares.length);
  expressMiddlewares.forEach(middleware => app.use(middleware));

  // applying middlewares
  stats.set('simpleExpressMiddlewares', simpleExpressMiddlewares.length);
  simpleExpressMiddlewares.forEach(middleware => {
    app.use(createHandlerWithParams(middleware));
  });

  // applying routes
  routes.forEach(({ handlers, path, validate }) => {
    if (path.indexOf('/') !== 0 && path !== '*') {
      log.warning(`Path "${path}" does not start with "/"`);
    }
    forEach(handlers, (handler, method) => {
      if (!Array.isArray(handler)) {
        handler = [handler];
      }

      stats.registerEvent('registeringRoute', { path, method: mapMethod(method), numberOfHandlers: handler.length, names: handler.map(el => !el.name || el.name === method ? 'anonymous' : el.name) });
      app[mapMethod(method)](path, ...handler.map(createHandlerWithParams));
    });
  });

  // applying error handlers
  stats.set('errorHandlers', errorHandlers.length);
  errorHandlers.forEach(errorHandler => {
    app.use(createErrorHandlerWithParams(errorHandler));
  });

  // starting actual server
  app.server.listen(port);

  if (!app.server.address()) {
    log(`ERROR: App started but app.server.address() is undefined. It seems that the ${port} port is already used.`);
    throw new Error(`App started but it doesn't seem to listen on any port. Check if port ${port} is not already used.`);
  }

  stats.logStartup();
  log(`App is listening on port ${port}`);

  return { app, server, stats };
};

export const wrapMiddleware = middleware => {
  if (Array.isArray(middleware)) {
    return middleware.map(el => ({ req, res, next }) => {
      el(req, res, next);
    })
  }
  return ({ req, res, next }) => {
    middleware(req, res, next);
  }
};

export default simpleExpress;
