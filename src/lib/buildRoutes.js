import { Router } from 'express';
import forEach from 'lodash/forEach';
import trim from 'lodash/trim';
import trimEnd from 'lodash/trimEnd';
import trimStart from 'lodash/trimStart';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import set from 'lodash/set';
import get from 'lodash/get';

import log from './log';

const defaultRouterOptions = {
  mergeParams: true,
};

const methodsRecognized = [
  'get',
  'post',
  'put',
  'delete',
  'del',
  'options',
  'patch',
  'head',

  'checkout',
  'copy',
  'lock',
  'merge',
  'mkactivity',
  'mkcol',
  'move',
  'm-search',
  'notify',
  'purge',
  'report',
  'search',
  'subscribe',
  'trace',
  'unlock',
  'unsubscribe',
];

const mapMethod = method => method.toLowerCase();

const normalizePath = (...paths) => {
  return paths.map((path, index) => {
    if (!path) {
      return '';
    }
    if (index === 0 && index === paths.length - 1) {
      return path;
    }
    if (index === 0) {
      return trimEnd(path, '/');
    }
    if (index === paths.length - 1) {
      return trimStart(path, '/');
    }
    return trim(path, '/');
  }).filter(el => el);
};

const joinPath = (...paths) => {
  return normalizePath(...paths).join('/');
};


const getRoutesAgregator = ({ stats }) => {
  const routes = {};

  const routesAgregator = {
    registerRoute: ({ path, method, handler }) => {
      if (!method) {
        // middleware, not logged for now
        return;
      }
      const pathNormalized = normalizePath(path);
      const methodNormalized = mapMethod(method);

      set(routes, [...pathNormalized, 'path'], path);
      set(routes, [...pathNormalized, 'method'], methodNormalized);
      set(routes, [...pathNormalized, 'numberOfHandlers'], get(routes, [...pathNormalized, 'numberOfHandlers'], 0) + 1);
      set(
        routes,
        [...pathNormalized, 'names'],
        [
          ...get(routes, [...pathNormalized, 'names'], []),
          !handler.name || handler.name === method ? 'anonymous' : handler.name
        ]
      );
      // console.log('handler', handler.toString());
      set(
        routes,
        [...pathNormalized, 'handlers'],
        [
          ...get(routes, [...pathNormalized, 'handlers'], []),
          handler.toString(),
        ]
      );
    },
    logRoute: (routes) => {
      if (routes.path) {
        return stats.registerEvent('registeringRoute', {
          path: joinPath(...routes.path),
          method: routes.method,
          numberOfHandlers: routes.numberOfHandlers,
          names: routes.names,
        });
      }
      forEach(routes, routesAgregator.logRoute);
    },
    logRoutes: () => {
      routesAgregator.logRoute(routes);
    },
    getRoutes: () => routes,
  };

  return routesAgregator;
};

const attach = (router) => (method, ...handlers) => {
  const [first, ...rest] = handlers;
  if (typeof first === 'string') {
    return router[method](first, ...rest);
  }
  return router[method]('/', ...handlers);
};



const getBuildRoutes = ({ stats, createHandlerWithParams }) => {
  const routesAgregator = getRoutesAgregator({ stats });

  const createRouter = (el, { subPath = [], method } = {}) => {
    if (isFunction(el)) {
      routesAgregator.registerRoute({ path: subPath, method, handler: el });
      return createHandlerWithParams(el);
    }

    const subRouter = Router(defaultRouterOptions);

    if (isPlainObject(el)) {
      const { path, handlers, routes, ...rest } = el;
      if (path) {
        if (!handlers && !routes) {
          attach(subRouter)('use', path, createRouter(rest, { subPath: [...subPath, path], method }));
        }
        if (handlers) {
          attach(subRouter)('use', path, createRouter(handlers, { subPath: [...subPath, path], method }));
        }
        if (routes) {
          attach(subRouter)('use', path, createRouter(routes, { subPath: [...subPath, path], method }));
        }
      } else {
        forEach(el, (subEl, subKey) => {
          if (methodsRecognized.includes(subKey)) {
            attach(subRouter)(subKey, createRouter(subEl, { subPath, method: subKey }));
          } else {
            attach(subRouter)('use', subKey, createRouter(subEl, { subPath: [...subPath, subKey], method }));
          }
        });
      }
    }
    if (Array.isArray(el)) {
      const [firstElement, ...rest] = el;
      if (typeof firstElement === 'string') {
        attach(subRouter)('use', firstElement, createRouter(rest, { subPath: [...subPath, firstElement], method }));
      } else {
        el.forEach(subEl => {
          attach(subRouter)('use', createRouter(subEl, { subPath, method }));
        });
      }
    }

    return subRouter;
  };

  return (routes) => {
    const router = createRouter(routes);
    routesAgregator.logRoutes();
    return router;
  };
};

export default getBuildRoutes;
