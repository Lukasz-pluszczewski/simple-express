import { Router } from 'express';
import _ from 'lodash';

const defaultRouterOptions = {
  mergeParams: true,
};

const methodsRecognized = [
  'use',

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
      return _.trimEnd(path, '/');
    }
    if (index === paths.length - 1) {
      return _.trimStart(path, '/');
    }
    return _.trim(path, '/');
  }).filter(el => el);
};

const joinPath = (...paths) => {
  return normalizePath(...paths).join('/');
};


const getRoutesAgregator = ({ stats }) => {
  const routes = {};

  const routesAgregator = {
    registerRoute: ({ path, method, handler }) => {
      const pathNormalized = normalizePath(path);
      const methodNormalized = method ? mapMethod(method) : 'use (middleware)';

      _.set(routes, [...pathNormalized, method, 'path'], path);
      _.set(routes, [...pathNormalized, method, 'method'], methodNormalized);
      _.set(routes, [...pathNormalized, method, 'numberOfHandlers'], _.get(routes, [...pathNormalized, 'numberOfHandlers'], 0) + 1);
      _.set(
        routes,
        [...pathNormalized, method, 'names'],
        [
          ..._.get(routes, [...pathNormalized, 'names'], []),
          !handler.name || handler.name === method ? 'anonymous' : handler.name
        ]
      );
      _.set(
        routes,
        [...pathNormalized, method, 'handlers'],
        [
          ..._.get(routes, [...pathNormalized, 'handlers'], []),
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
      _.forEach(routes, routesAgregator.logRoute);
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
    if (_.isFunction(el)) {
      routesAgregator.registerRoute({ path: subPath, method, handler: el });
      return createHandlerWithParams(el);
    }

    const subRouter = Router(defaultRouterOptions);

    if (_.isPlainObject(el)) {
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
        _.forEach(el, (subEl, subKey) => {
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
