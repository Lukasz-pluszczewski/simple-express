import { Request, Response, NextFunction } from 'express';

import sendResponse from "./sendResponse";
import { chainPlugins } from "./pluginUtils";
import { log } from "../log";

import {
  Plugin,
  HandlerParams,
  RequestObject,
  ResponseDefinition,
  SingleHandler,
  SingleErrorHandler,
} from '../types';

export const createHandler = <AdditionalRouteParams extends Record<string, unknown> = {}, TLocals extends Record<string, unknown> = {}>(
  { additionalParams, plugins }: { additionalParams: AdditionalRouteParams, plugins: ReturnType<Plugin>[] }
) => (
  handler: SingleHandler<AdditionalRouteParams, TLocals>
) => async (
  req: RequestObject,
  res: Response,
  next: NextFunction
) => {
  // console.log('got request');
    let result;

    if (!req.requestTiming) {
      req.requestTiming = Date.now();
      log.request(
        `Request started ${req.requestTiming}ms, ${req.protocol}, ${req.originalUrl}`
      );
    }

    const handlerParams = await chainPlugins<HandlerParams & AdditionalRouteParams, any>(
      plugins,
      "getHandlerParams",
    )({
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
        ...additionalParams,
      } as HandlerParams & AdditionalRouteParams
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
      (previousResult: any) => !previousResult || previousResult.type === "none",
    )(result, handlerParams);
    sendResponse(req, res, mappedResult as any);
  };

export const createErrorHandler = <AdditionalRouteParams extends Record<string, unknown> = {}, TLocals extends Record<string, unknown> = {}>(
  { additionalParams, plugins }: { additionalParams: AdditionalRouteParams, plugins: ReturnType<Plugin>[] },
) => (
  handler: SingleErrorHandler
) => async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    let result;

    const handlerParams = await chainPlugins<Omit<HandlerParams, 'params'> & AdditionalRouteParams, any>(
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
      ...additionalParams,
    } as Omit<HandlerParams, 'params'> & AdditionalRouteParams);

    try {
      result = await handler(error, handlerParams as any);
    } catch (error) {
      return next(error);
    }

    if (result instanceof Error) {
      return next(result);
    }

    const mappedResult = await chainPlugins(
      plugins,
      "mapResponse",
      (previousResult: ResponseDefinition) => !previousResult || previousResult.type === "none"
    )(result, handlerParams);
    sendResponse(req, res, mappedResult as any);
  };

export default {
  createErrorHandler,
  createHandler,
};
