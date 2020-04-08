import { Router } from 'express';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import trim from 'lodash/trim';
import trimEnd from 'lodash/trimEnd';
import trimStart from 'lodash/trimStart';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';

import log from './log';

const availableMethods = [
  'checkout',
  'copy',
  'delete',
  'get',
  'head',
  'lock',
  'merge',
  'mkactivity',
  'mkcol',
  'move',
  'm-search',
  'notify',
  'options',
  'patch',
  'post',
  'purge',
  'put',
  'report',
  'search',
  'subscribe',
  'trace',
  'unlock',
  'unsubscribe',
];

const methodsExcluded = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
];

const mapMethod = method => method.toLowerCase();

const joinPath = (...paths) => {
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
  }).filter(el => el).join('/');
};

const getHandlersAndRoutes = source => {
  if (Array.isArray(source)) {
    return {
      routes: source,
    };
  }
  return {
    handlers: pick(source, methodsExcluded),
    routes: omit(source, methodsExcluded),
  };
};

const getRoute = (route, key) => {
/* Possible route shapes
  // simple objects with path, handlers and routes
  const route1 = {
    path: '/',
    handlers: handlersObject,
  };
  const route2 = {
    path: '/foo',
    handlers: handlersObject,
    routes: children,
  };

  // objects
  const route3 = {
    '/bar': handlersObject,
  };

  // arrays
  const route4 = [
    ...children,
  ];
  const route5 = [
    '/',
    handlersObject,
  ];
  const route6 = [
    '/foo',
    children,
  ];

  // fields of objects (with +key)
    // already handlers
  const route7 = handlersObject; // +key

    // objects with handlers and routes
  const route8 = { // +key
    handlers: handlersObject,
    routes: children,
  };
    // objects
  const route9 = { // +key; seems to be equal to 7?
    '/bar': handlersObject,
  };
    // arrays
  const route10 = [ // +key
    '/',
    handlersObject,
  ];
  const route11 = [ // +key
    '/foo',
    children,
  ];
  const route12 = [ // +key
    '/foo',
    [
      '/bar',
      children || handlersObject,
    ]
  ]

  const route13 = [ // + key
    ...children,
  ];
*/
  if (key) {
    // 7 - 13
    if (Array.isArray(route)) {
      // 10 - 13
      if (typeof route[0] === 'string') {
        // 10 - 12
        return { path: key, children: [route] };
      }
      // 13
      return { path: key, children: route };
    }
    // 7 - 9
    if (route.handlers || route.routes) {
      // 8
      return { path: key, handlersObject: route.handlers, children: route.routes };
    }
    // 7, 9
    const { routes, handlers } = getHandlersAndRoutes(route);
    return { path: key, handlers, children: routes };
  }

  // 1 - 6
  if (Array.isArray(route)) {
    // 4 - 6
    if (typeof route[0] === 'string') {
      // 5 - 6
      const { routes, handlers } = getHandlersAndRoutes(route[1]);
      if (Array.isArray(routes) && typeof routes[0] === 'string') {
        return { path: route[0], handlersObject: handlers, children: [routes] };
      }
      return { path: route[0], handlersObject: handlers, children: routes };
    }
    // 4
    return { children: route };
  }
  // 1 - 3
  if (route.path) {
    // 1 - 2
    return { path: route.path, handlersObject: route.handlers, children: route.routes };
  }
  // 3
  return { children: route };
};

const getAttachHandlers = ({ stats, createHandlerWithParams }) => (router, handlers, path, joinedPath, logAsRoute = true) => {
  if (path.indexOf('/') !== 0 && path !== '*') {
    log.warning(`Path "${path}" does not start with "/"`);
  }
  forEach(handlers, (handler, method) => {
    if (!Array.isArray(handler)) {
      handler = [handler];
    }
    if (logAsRoute) {
      stats.registerEvent('registeringRoute', {
        path: joinedPath,
        method: mapMethod(method),
        numberOfHandlers: handler.length,
        names: handler.map(el => !el.name || el.name === method ? 'anonymous' : el.name)
      });
    }
    if (path) {
      router[mapMethod(method)](path, ...handler.map(createHandlerWithParams));
    } else {
      router[mapMethod(method)](...handler.map(createHandlerWithParams));
    }
  });

  return router;
};

const getBuildRoutes = ({ stats, createHandlerWithParams }) => {
  const attachHandlers = getAttachHandlers({ stats, createHandlerWithParams });

  const buildRoutes = (routes, subPath) => {
    const isRoutesArray = Array.isArray(routes);
    const router = Router();
    forEach(routes, (route, key) => {
      const { path, handlersObject, children, middlewares } = getRoute(route, isRoutesArray ? null : key);
      const joinedPath = joinPath(subPath, path);
      const subRouter = Router();
      const middlewareRouter = Router();

      if (handlersObject && !isEmpty(handlersObject)) {
        attachHandlers(subRouter, handlersObject, null, joinedPath);
      }
      if (children && !isEmpty(children)) {
        subRouter.use(subRouter, buildRoutes(children, joinedPath));
      }

      if (middlewares && !isEmpty(middlewares)) {
        attachHandlers(middlewareRouter, middlewares, null, joinedPath);
      }
      router.use(path, middlewareRouter, subRouter);
    });
    return router;
  };

  return buildRoutes;
};

export default getBuildRoutes;
