import sendResponse from './sendResponse';
import log from './log';

export const createHandler = (additionalParams = {}, simpleExpress) => handler => async (req, res, next) => {
  let result;

  if (!req.requestTiming) {
    req.requestTiming = Date.now();
    log.request(`Request started ${req.requestTiming}ms, ${req.protocol}, ${req.originalUrl}`);
  }

  try {
    result = await handler({
      body: req.body,
      query: req.query,
      params: req.params,
      method: req.method,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      xhr: req.xhr,
      get: headerName => req.get(headerName),
      getHeader: headerName => req.get(headerName),
      locals: res.locals,
      next,
      req,
      res,
      ...additionalParams,
      simpleExpress,
    });
  } catch (error) {
    return next(error);
  }

  if (result instanceof Error) {
    return next(result);
  }
  sendResponse(req, res, result);
};

export const createErrorHandler = (additionalParams = {}, simpleExpress) => handler => async(error, req, res, next) => {
  let result;

  try {
    result = await handler(error, {
      body: req.body,
      query: req.query,
      // params: req.params, // params are reset before error handlers, for whatever reason: https://github.com/expressjs/express/issues/2117
      method: req.method,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      xhr: req.xhr,
      get: req.get,
      getHeader: headerName => req.get(headerName),
      locals: res.locals,
      next,
      req,
      res,
      ...additionalParams,
      simpleExpress,
    });
  } catch (error) {
    return next(error);
  }

  if (result instanceof Error) {
    return next(result);
  }
  sendResponse(req, res, result);
};

export default {
  createErrorHandler,
  createHandler,
};
