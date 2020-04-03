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
  routes: rawRoutes = [],
  simpleExpressMiddlewares = [],
  errorHandlers = [],
  expressMiddlewares = [],
  config: userConfig,
  routeParams = {},
  app: userApp = defaultAppValue,
  server: userServer = defaultServerValue,
}) => {
  if (port) {
    log(`Initializing simpleExpress app on port ${port}...`);
  } else {
    log(`Initializing simpleExpress app (no port)...`);
  }
  // create stats
  const stats = getStats(port);

  // creating express app
  const app = userApp === defaultAppValue ? express() : userApp;
  const server = userServer === defaultServerValue ? http.createServer(app) : userServer;
  app.server = server;

  // creating simpleExpress helper utility
  const simpleExpressHelper = await createSimpleExpressHelper({ rawRoutes, routeParams });

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
  const routes = Array.isArray(rawRoutes) ? rawRoutes : Object.keys(rawRoutes).map(path => {
    return { path, handlers: rawRoutes[path] };
  });
  if (Array.isArray(routes)) {
    routes.forEach(route => {
      const { handlers, path } = Array.isArray(route) ? { path: route[0], handlers: route[1] } : route;
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
  }

  // applying error handlers
  stats.set('errorHandlers', errorHandlers.length);
  errorHandlers.forEach(errorHandler => {
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
