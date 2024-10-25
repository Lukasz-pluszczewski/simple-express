var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default,
  ensureArray: () => ensureArray,
  handleError: () => handleErrors_default,
  wrapMiddleware: () => wrapMiddleware
});
module.exports = __toCommonJS(src_exports);
var import_lodash3 = __toESM(require("lodash"));
var import_http = __toESM(require("http"));
var import_express2 = __toESM(require("express"));

// src/log.ts
var import_debug = __toESM(require("debug"));
var log = (0, import_debug.default)("simpleExpress");
log.request = (0, import_debug.default)("simpleExpress:request");
log.stats = (0, import_debug.default)("simpleExpress:stats");
log.warning = (0, import_debug.default)("simpleExpress:warning");

// src/stats.ts
var getStats = (port) => {
  const stats = {
    counters: {},
    events: {}
  };
  const addToList = (category, field, data) => {
    if (!stats[category]) {
      stats[category] = {};
    }
    if (!stats[category][field]) {
      stats[category][field] = [];
    }
    stats[category][field].push(data);
  };
  const logDefaultMiddlewares = (statsInstance2) => {
    const logMessages = [];
    if (statsInstance2.getCounter("cors")) {
      logMessages.push("cors");
    }
    if (statsInstance2.getCounter("jsonBodyParser")) {
      logMessages.push("bodyParser.json");
    }
    if (statsInstance2.getCounter("cookieParser")) {
      logMessages.push("cookie-parser");
    }
    if (statsInstance2.getCounter("helmet")) {
      logMessages.push("helmet");
    }
    if (logMessages.length) {
      log.stats(`  Used built-in middlewares: ${logMessages.join(", ")}`);
    }
    const notFoundMessages = [];
    if (statsInstance2.getCounter("cors-not-found")) {
      notFoundMessages.push("cors");
    }
    if (statsInstance2.getCounter("jsonBodyParser-not-found")) {
      notFoundMessages.push("bodyParser.json");
    }
    if (statsInstance2.getCounter("cookieParser-not-found")) {
      notFoundMessages.push("cookie-parser");
    }
    if (statsInstance2.getCounter("helmet-not-found")) {
      notFoundMessages.push("helmet");
    }
    if (notFoundMessages.length) {
      log.stats(`  Built-in middlewares enabled but corresponding libraries were not installed: ${notFoundMessages.join(", ")}. To use them, install the corresponding npm packages.`);
    }
  };
  const statsInstance = {
    set: (field, number = 1) => stats.counters[field] = number,
    add: (field, number = 1) => stats.counters[field] = stats.counters[field] ? stats.counters[field] + number : number,
    getCounter: (field) => stats.counters[field],
    registerEvent: (eventName, data) => {
      switch (eventName) {
        case "registeringRoute":
          statsInstance.add("routes");
          statsInstance.add("routeHandlers", data.numberOfHandlers);
          addToList("events", eventName, { timestamp: Date.now(), ...data });
          break;
        default:
          addToList("events", eventName, { timestamp: Date.now(), ...data });
      }
    },
    getEvents: (eventName) => stats.events[eventName],
    logStartup: () => {
      if (port) {
        log.stats(`-->Stats for simpleExpress app on ${port} port:<--`);
      } else {
        log.stats(`-->Stats for simpleExpress app (no port):<--`);
      }
      logDefaultMiddlewares(statsInstance);
      if (statsInstance.getCounter("expressMiddleware")) {
        log.stats(
          `  Registered ${statsInstance.getCounter(
            "expressMiddleware"
          )} expressMiddleware${statsInstance.getCounter("expressMiddleware") > 1 ? "s" : ""}`
        );
      }
      if (statsInstance.getCounter("middleware")) {
        log.stats(
          `  Registered ${statsInstance.getCounter("middleware")} middleware${statsInstance.getCounter("middleware") > 1 ? "s" : ""}`
        );
      }
      if (statsInstance.getCounter("errorHandlers")) {
        log.stats(
          `  Registered ${statsInstance.getCounter(
            "errorHandlers"
          )} errorHandlers${statsInstance.getCounter("errorHandlers") > 1 ? "s" : ""}`
        );
      }
      if (!statsInstance.getCounter("routes")) {
        return log.stats(`  No routes registered`);
      }
      log.stats(
        `  Registered ${statsInstance.getCounter(
          "routes"
        )} routes with ${statsInstance.getCounter("routeHandlers")} handlers:`
      );
      const mappedRoutes = /* @__PURE__ */ new Set();
      const mappedMethods = {};
      stats.events.registeringRoute.forEach((routeEvent) => {
        const { path, method, numberOfHandlers, names } = routeEvent;
        if (!mappedMethods[path]) {
          mappedMethods[path] = [];
        }
        mappedMethods[path].push({ method, numberOfHandlers, names });
        mappedRoutes.add(path);
      });
      mappedRoutes.forEach((path) => {
        const invalidRoute = path.indexOf("/") !== 0 && path !== "*";
        log.stats(
          `    ${path}${invalidRoute ? ' - WARNING: Route not starting with "/"!' : ""}`
        );
        mappedMethods[path].forEach(
          ({ method, numberOfHandlers, names = [] }) => {
            let foundNames = false;
            names.forEach((name) => {
              if (name !== "anonymous") {
                foundNames = true;
              }
            });
            log.stats(
              `      ${method}${numberOfHandlers > 1 || foundNames ? `, ${numberOfHandlers} handler${numberOfHandlers === 1 ? "" : "s"}` : ""}${names && names.length && foundNames ? `: ${names.join(", ")}` : ""}`
            );
          }
        );
      });
    }
  };
  return statsInstance;
};

// src/buildRoutes.ts
var import_express = require("express");
var import_lodash = __toESM(require("lodash"));
var defaultRouterOptions = {
  mergeParams: true
};
var methodsRecognized = [
  "use",
  "get",
  "post",
  "put",
  "delete",
  "del",
  "options",
  "patch",
  "head",
  "checkout",
  "copy",
  "lock",
  "merge",
  "mkactivity",
  "mkcol",
  "move",
  "m-search",
  "notify",
  "purge",
  "report",
  "search",
  "subscribe",
  "trace",
  "unlock",
  "unsubscribe"
];
var mapMethod = (method) => method.toLowerCase();
var normalizePath = (...paths) => {
  return paths.map((path, index) => {
    if (!path) {
      return "";
    }
    if (index === 0 && index === paths.length - 1) {
      return path;
    }
    if (index === 0) {
      return import_lodash.default.trimEnd(path, "/");
    }
    if (index === paths.length - 1) {
      return import_lodash.default.trimStart(path, "/");
    }
    return import_lodash.default.trim(path, "/");
  }).filter((el) => el);
};
var joinPath = (...paths) => {
  return normalizePath(...paths).join("/");
};
var getRoutesAggregator = ({ stats }) => {
  const routes = {};
  const routesAggregator = {
    registerRoute: ({ path, method, handler }) => {
      const pathNormalized = normalizePath(path);
      const methodNormalized = method ? mapMethod(method) : "use (middleware)";
      import_lodash.default.set(routes, [...pathNormalized, method, "path"], path);
      import_lodash.default.set(routes, [...pathNormalized, method, "method"], methodNormalized);
      import_lodash.default.set(
        routes,
        [...pathNormalized, method, "numberOfHandlers"],
        import_lodash.default.get(routes, [...pathNormalized, "numberOfHandlers"], 0) + 1
      );
      import_lodash.default.set(
        routes,
        [...pathNormalized, method, "names"],
        [
          ...import_lodash.default.get(routes, [...pathNormalized, "names"], []),
          !handler.name || handler.name === method ? "anonymous" : handler.name
        ]
      );
      import_lodash.default.set(
        routes,
        [...pathNormalized, method, "handlers"],
        [
          ...import_lodash.default.get(routes, [...pathNormalized, "handlers"], []),
          handler.toString()
        ]
      );
    },
    logRoute: (routes2) => {
      if (routes2.path) {
        return stats.registerEvent("registeringRoute", {
          path: joinPath(...routes2.path),
          method: routes2.method,
          numberOfHandlers: routes2.numberOfHandlers,
          names: routes2.names
        });
      }
      import_lodash.default.forEach(routes2, routesAggregator.logRoute);
    },
    logRoutes: () => {
      routesAggregator.logRoute(routes);
    },
    getRoutes: () => routes
  };
  return routesAggregator;
};
var attach = (router) => (method, ...handlers) => {
  const [first, ...rest] = handlers;
  if (typeof first === "string") {
    return router[method](first, ...rest);
  }
  return router[method]("/", ...handlers);
};
var getBuildRoutes = ({ stats, createHandlerWithParams }) => {
  const routesAggregator = getRoutesAggregator({ stats });
  const createRouter = (el, { subPath = [], method } = {}) => {
    if (import_lodash.default.isFunction(el)) {
      routesAggregator.registerRoute({ path: subPath, method, handler: el });
      return createHandlerWithParams(el);
    }
    const subRouter = (0, import_express.Router)(defaultRouterOptions);
    if (import_lodash.default.isPlainObject(el)) {
      const { path, handlers, routes, ...rest } = el;
      if (path) {
        if (!handlers && !routes) {
          attach(subRouter)(
            "use",
            path,
            createRouter(rest, { subPath: [...subPath, path], method })
          );
        }
        if (handlers) {
          attach(subRouter)(
            "use",
            path,
            createRouter(handlers, { subPath: [...subPath, path], method })
          );
        }
        if (routes) {
          attach(subRouter)(
            "use",
            path,
            createRouter(routes, { subPath: [...subPath, path], method })
          );
        }
      } else {
        import_lodash.default.forEach(el, (subEl, subKey) => {
          if (methodsRecognized.includes(subKey)) {
            attach(subRouter)(
              subKey,
              createRouter(subEl, { subPath, method: subKey })
            );
          } else {
            attach(subRouter)(
              "use",
              subKey,
              createRouter(subEl, { subPath: [...subPath, subKey], method })
            );
          }
        });
      }
    }
    if (Array.isArray(el)) {
      const [firstElement, ...rest] = el;
      if (typeof firstElement === "string") {
        attach(subRouter)(
          "use",
          firstElement,
          createRouter(rest, { subPath: [...subPath, firstElement], method })
        );
      } else {
        el.forEach((subEl) => {
          attach(subRouter)("use", createRouter(subEl, { subPath, method }));
        });
      }
    }
    return subRouter;
  };
  return (routes) => {
    const router = createRouter(routes);
    routesAggregator.logRoutes();
    return router;
  };
};
var buildRoutes_default = getBuildRoutes;

// src/handler/sendResponse.ts
var responseMethods = {
  default: "send",
  json: "json",
  send: "send",
  none: null
};
var getResponseMethod = (method, body) => {
  if (!method || !responseMethods.hasOwnProperty(method)) {
    return responseMethods.default;
  }
  return responseMethods[method];
};
var sendResponse = (req, res, result) => {
  if (!result) {
    return;
  }
  if (res.headersSent) {
    return log("ERROR: Headers have already been sent");
  }
  const {
    body = null,
    status,
    method,
    redirect = false,
    headers = null,
    type = null
  } = result;
  const responseMethod = getResponseMethod(method, body);
  if (responseMethod) {
    if (type) {
      res.type(type);
    }
    if (headers) {
      res.set(headers);
    }
    if (redirect) {
      if (status) {
        res.redirect(status, redirect);
      } else {
        res.redirect(redirect);
      }
      log.request(
        `Request ended with redirect after ${Date.now() - req.requestTiming}ms; ${req.protocol}, ${req.originalUrl}${status && `, status: ${status}`}`
      );
    } else {
      log.request(
        `Request ended with response after ${Date.now() - req.requestTiming}ms; ${req.protocol}, ${req.originalUrl}, status: ${status || 200}`
      );
      res.status(status || 200)[responseMethod](body);
    }
  }
};
var sendResponse_default = sendResponse;

// src/utils/asyncCollections.ts
var Break = Symbol("BreakSymbol");
var LastClass = class {
  constructor(value) {
    this.value = value;
  }
};
async function asyncReduce(array, callback, initialValue) {
  let accumulator = initialValue;
  for (let i = 0; i < array.length; i++) {
    const iterationResult = await callback(accumulator, array[i], i, array);
    if (iterationResult instanceof LastClass) {
      accumulator = iterationResult.value;
      break;
    }
    accumulator = iterationResult;
  }
  return accumulator;
}

// src/handler/pluginUtils.ts
var chainPlugins = (plugins, method, breakCondition = () => false) => async (param, ...rest) => {
  const lastResult = await asyncReduce(
    plugins,
    async (previousResult, plugin, index) => {
      if (plugin[method] && !breakCondition(previousResult)) {
        return plugin[method](previousResult, ...rest);
      }
      return previousResult;
    },
    param
  );
  return lastResult;
};

// src/handler/createHandler.ts
var createHandler = ({ additionalParams, plugins }) => (handler) => async (req, res, next) => {
  let result;
  if (!req.requestTiming) {
    req.requestTiming = Date.now();
    log.request(
      `Request started ${req.requestTiming}ms, ${req.protocol}, ${req.originalUrl}`
    );
  }
  const handlerParams = await chainPlugins(
    plugins,
    "getHandlerParams"
  )(
    {
      body: req.body,
      query: req.query,
      params: req.params,
      method: req.method,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      xhr: req.xhr,
      get: req.get.bind(req),
      getHeader: req.get.bind(req),
      locals: res.locals,
      next,
      req,
      res,
      ...additionalParams
    }
  );
  try {
    result = await handler(handlerParams);
  } catch (error) {
    return next(error);
  }
  if (result instanceof Error) {
    return next(result);
  }
  const mappedResult = await chainPlugins(
    plugins,
    "mapResponse",
    (previousResult) => !previousResult || previousResult.type === "none"
  )(result, handlerParams);
  sendResponse_default(req, res, mappedResult);
};
var createErrorHandler = ({ additionalParams, plugins }) => (handler) => async (error, req, res, next) => {
  let result;
  const handlerParams = await chainPlugins(
    plugins,
    "getErrorHandlerParams"
  )({
    body: req.body,
    query: req.query,
    // params: req.params, // params are reset before error handlers, for whatever reason: https://github.com/expressjs/express/issues/2117
    method: req.method,
    originalUrl: req.originalUrl,
    protocol: req.protocol,
    xhr: req.xhr,
    get: req.get,
    getHeader: req.get,
    locals: res.locals,
    next,
    req,
    res,
    ...additionalParams
  });
  try {
    result = await handler(error, handlerParams);
  } catch (error2) {
    return next(error2);
  }
  if (result instanceof Error) {
    return next(result);
  }
  const mappedResult = await chainPlugins(
    plugins,
    "mapResponse",
    (previousResult) => !previousResult || previousResult.type === "none"
  )(result, handlerParams);
  sendResponse_default(req, res, mappedResult);
};

// src/handleErrors.ts
var import_lodash2 = __toESM(require("lodash"));
var validateErrorClass = (errorClass) => {
  if (errorClass && !import_lodash2.default.isFunction(errorClass)) {
    throw new Error(
      `handleError arguments error: expected constructor (e.g. Error class) but got ${typeof errorClass}`
    );
  }
};
var validateHandler = (errorHandler) => {
  if (!import_lodash2.default.isFunction(errorHandler)) {
    throw new Error(
      `handleError arguments error: expected error handler function but got ${typeof errorHandler}`
    );
  }
};
var getArgs = (args) => {
  const results = [];
  if (Array.isArray(args[0]) && args.length === 2 && typeof args[0][0] === "function") {
    args[0].forEach((errorClass) => {
      results.push([errorClass, args[1]]);
    });
  } else if (Array.isArray(args[0])) {
    args[0].forEach((tuple) => {
      if (tuple.length === 1) {
        results.push([null, tuple[0]]);
      } else if (!Array.isArray(tuple)) {
        results.push([null, tuple]);
      } else if (Array.isArray(tuple[0])) {
        tuple[0].forEach((errorClass) => {
          results.push([errorClass, tuple[1]]);
        });
      } else {
        results.push([tuple[0], tuple[1]]);
      }
    });
    if (args[1]) {
      results.push([null, args[1]]);
    }
  } else if (args.length === 1) {
    results.push([null, args[0]]);
  } else if (args.length === 2) {
    results.push([args[0], args[1]]);
  } else {
    throw new Error("handleErrors arguments error: expected 1 or 2 arguments");
  }
  return results;
};
var handleError = ([errorClass, errorHandler]) => {
  validateErrorClass(errorClass);
  validateHandler(errorHandler);
  return (error, handlerParams) => {
    if (!errorClass || error instanceof errorClass) {
      return errorHandler(error, handlerParams);
    }
    return error;
  };
};
var handleErrors_default = (...args) => {
  const errorHandlers = getArgs(args);
  return errorHandlers.map(handleError);
};

// src/constants.ts
var defaultAppValue = Symbol("defaultAppValue");
var defaultServerValue = Symbol("defaultServerValue");

// src/index.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var getDefaultConfig = (userConfig, defaultConfig = {
  cors: null,
  jsonBodyParser: null,
  cookieParser: [],
  helmet: null
}) => {
  if (!userConfig) {
    return defaultConfig;
  }
  const {
    cors = defaultConfig.cors,
    jsonBodyParser = defaultConfig.jsonBodyParser,
    cookieParser = defaultConfig.cookieParser
  } = userConfig;
  return {
    cors,
    jsonBodyParser,
    cookieParser
  };
};
var simpleExpress = async ({
  port,
  plugins: rawPlugins = [],
  routes = [],
  middleware: rawMiddleware = [],
  errorHandlers = [],
  expressMiddleware = [],
  config: userConfig,
  routeParams = {},
  app: userApp = defaultAppValue,
  server: userServer = defaultServerValue
} = {}) => {
  if (port) {
    log(`Initializing simpleExpress app on port ${port}...`);
  } else {
    log(`Initializing simpleExpress app (no port)...`);
  }
  let middleware = ensureArray(rawMiddleware);
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
    server: userServer
  };
  const plugins = rawPlugins.map(
    (plugin) => plugin(simpleExpressConfigForPlugins)
  );
  const stats = getStats(port);
  const app = userApp === defaultAppValue ? (0, import_express2.default)() : userApp;
  const server = userServer === defaultServerValue ? import_http.default.createServer(app) : userServer;
  app.server = server;
  const config = getDefaultConfig(userConfig);
  if (config.cors !== false) {
    try {
      const cors = require("cors");
      stats.set("cors");
      app.use(cors(config.cors));
    } catch (error) {
      stats.set("cors-not-found");
    }
  }
  if (config.jsonBodyParser !== false) {
    try {
      const bodyParser = require("body-parser");
      stats.set("jsonBodyParser");
      app.use(bodyParser.json(config.jsonBodyParser));
    } catch (error) {
      stats.set("jsonBodyParser-not-found");
    }
  }
  if (config.cookieParser !== false) {
    try {
      const cookieParser = require("cookie-parser");
      stats.set("cookieParser");
      app.use(cookieParser(config.cookieParser[0], config.cookieParser[1]));
    } catch (error) {
      stats.set("cookieParser-not-found");
    }
  }
  if (config.helmet !== false) {
    try {
      const helmet = require("helmet");
      stats.set("helmet");
      app.use(helmet(config.helmet));
    } catch (error) {
      stats.set("helmet-not-found");
    }
  }
  const createHandlerWithParams = createHandler({ additionalParams: routeParams, plugins });
  const createErrorHandlerWithParams = createErrorHandler({ additionalParams: routeParams, plugins });
  const expressMiddlewareFlat = import_lodash3.default.flattenDeep(expressMiddleware);
  stats.set("expressMiddleware", expressMiddlewareFlat.length);
  expressMiddlewareFlat.forEach((middleware2) => app.use(middleware2));
  const middlewareFlat = import_lodash3.default.flattenDeep(middleware);
  stats.set("middleware", middlewareFlat.length);
  middlewareFlat.forEach((middleware2) => {
    app.use(createHandlerWithParams(middleware2));
  });
  app.use(
    buildRoutes_default({
      stats,
      createHandlerWithParams
    })(routes)
  );
  const errorHandlersFlat = import_lodash3.default.flattenDeep(ensureArray(errorHandlers));
  stats.set("errorHandlers", errorHandlersFlat.length);
  errorHandlersFlat.forEach((errorHandler) => {
    app.use(createErrorHandlerWithParams(errorHandler));
  });
  if (port) {
    app.server.listen(typeof port === "number" ? port : parseInt(port, 10));
  }
  if (port && !app.server.address()) {
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
  return { app, server, stats };
};
var wrapMiddleware = (...middleware) => import_lodash3.default.flattenDeep(middleware).map((el) => ({ req, res, next }) => {
  el(req, res, next);
});
var src_default = simpleExpress;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ensureArray,
  handleError,
  wrapMiddleware
});
