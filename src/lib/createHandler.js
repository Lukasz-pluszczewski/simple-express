import sendResponse from './sendResponse';
import log from './log';

export const createHandler = (additionalParams = {}, simpleExpress) => handler => async (req, res, next) => {
  let result;

  req.requestTiming = Date.now();
  log.request(`Request started ${req.requestTiming}ms, ${req.protocol}, ${req.originalUrl}`);

  try {
    result = await handler({
      body: req.body,
      query: req.query,
      params: req.params,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      xhr: req.xhr,
      get: headerName => req.get(headerName),
      getHeader: headerName => req.get(headerName),
      next,
      req,
      res,
      ...additionalParams,
      simpleExpress,
    });
  } catch (error) {
    return next(error);
  }

  sendResponse(req, res, result);
};

export const createErrorHandler = (additionalParams = {}, simpleExpress) => handler => async(error, req, res, next) => {
  let result;

  try {
    result = await handler(error, {
      body: req.body,
      query: req.query,
      params: req.params,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      xhr: req.xhr,
      get: req.get,
      next,
      req,
      res,
      ...additionalParams,
      simpleExpress,
    });
  } catch (error) {
    return next(error);
  }

  sendResponse(req, res, result);
};

export default {
  createErrorHandler,
  createHandler,
};
