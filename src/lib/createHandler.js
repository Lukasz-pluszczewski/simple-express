import sendResponse from "./sendResponse";
import { chainPlugins } from "./pluginUtils";
import log from "./log";

export const createHandler =
  ({ additionalParams = {}, plugins }, simpleExpress) =>
  (handler) =>
  async (req, res, next) => {
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
    )({
      body: req.body,
      query: req.query,
      params: req.params,
      method: req.method,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      xhr: req.xhr,
      get: (headerName) => req.get(headerName),
      getHeader: (headerName) => req.get(headerName),
      locals: res.locals,
      next,
      req,
      res,
      ...additionalParams,
      simpleExpress,
    });

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
    sendResponse(req, res, mappedResult);
  };

export const createErrorHandler =
  ({ additionalParams = {}, plugins }, simpleExpress) =>
  (handler) =>
  async (error, req, res, next) => {
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
      getHeader: (headerName) => req.get(headerName),
      locals: res.locals,
      next,
      req,
      res,
      ...additionalParams,
      simpleExpress,
    });

    try {
      result = await handler(error, handlerParams);
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
    sendResponse(req, res, mappedResult);
  };

export default {
  createErrorHandler,
  createHandler,
};
