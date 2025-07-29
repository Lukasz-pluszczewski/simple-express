import { Request, Response, NextFunction } from 'express';

import sendResponse from './sendResponse';
import { chainPlugins } from './pluginUtils';
import { log } from '../log';

import {
  Plugin,
  HandlerParams,
  RequestObject,
  ResponseDefinition,
  SingleHandler,
  SingleErrorHandler, RequestContextConfig, GlobalContextConfig, ContextContainer,
} from '../types';
import { RequestContextContainer, runInContext } from './context';
import { AsyncLocalStorage } from 'node:async_hooks';

export const createHandler = <AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>>(
  { additionalParams, plugins, requestContextConfig, globalContextContainer, requestContextLocalStorage }: {
    additionalParams: AdditionalRouteParams,
    plugins: ReturnType<Plugin<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>>[],
    requestContextConfig?: RequestContextConfig<TRequestContext, AdditionalRouteParams, TLocals> | false,
    globalContextContainer?: ContextContainer<TGlobalContext>,
    requestContextLocalStorage?: AsyncLocalStorage<TRequestContext>,
  }
) => (
  handler: SingleHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
) => async (
  req: RequestObject,
  res: Response,
  next: NextFunction
) => {
  const contextParams = {
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
  } as HandlerParams<TLocals> & AdditionalRouteParams;

  const requestContextContainer = (requestContextConfig === false || requestContextConfig === undefined) ? undefined : RequestContextContainer(requestContextLocalStorage, contextParams, requestContextConfig);

  if (!req.requestTiming) {
    req.requestTiming = Date.now();
    log.request(
      `Request started ${req.requestTiming}ms, ${req.protocol}, ${req.originalUrl}`
    );
  }

  const handlerParams = await chainPlugins<HandlerParams<TLocals, TRequestContext, TGlobalContext> & AdditionalRouteParams, any>(
    plugins,
    'getHandlerParams',
  )({
      ...contextParams,
      requestContext: requestContextContainer,
      globalContext: globalContextContainer,
    } as HandlerParams<TLocals, TRequestContext, TGlobalContext> & AdditionalRouteParams
  );

  let result;

  await runInContext(globalContextContainer, async () => {
    return runInContext(requestContextContainer, async () => {
      try {
        result = await handler(handlerParams);
      } catch (error) {
        next(error);
        return;
      }
    });
  });

  if (result instanceof Error) {
    next(result);
    return;
  }

  const mappedResult = await chainPlugins(
    plugins,
    'mapResponse',
    (previousResult: any) => !previousResult || previousResult.type === 'none',
  )(result, handlerParams);
  sendResponse(req, res, mappedResult as any);
};

export const createErrorHandler = <AdditionalRouteParams extends Record<string, unknown> = Record<string, never>, TLocals extends Record<string, unknown> = Record<string, never>, TRequestContext extends Record<string, unknown> = Record<string, never>, TGlobalContext extends Record<string, unknown> = Record<string, never>>(
  { additionalParams, plugins, requestContextConfig, globalContextContainer, requestContextLocalStorage }: {
    additionalParams: AdditionalRouteParams,
    plugins: ReturnType<Plugin<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>>[],
    requestContextConfig?: RequestContextConfig<TRequestContext, AdditionalRouteParams, TLocals> | false,
    globalContextContainer?: ContextContainer<TGlobalContext>,
    requestContextLocalStorage?: AsyncLocalStorage<TRequestContext>,
  }
) => (
  handler: SingleErrorHandler<AdditionalRouteParams, TLocals, TRequestContext, TGlobalContext>
) => async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let result;

  const contextParams = {
    body: req.body,
    query: req.query,
    // params: req.params, // params are reset before error handlers, for whatever reason: https://github.com/expressjs/express/issues/2117
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
  } as HandlerParams<TLocals> & AdditionalRouteParams;

  const requestContextContainer = ((requestContextConfig === false || requestContextConfig === undefined) ? undefined : RequestContextContainer(requestContextLocalStorage, contextParams, requestContextConfig)) as TRequestContext extends false ? TRequestContext extends false ? never : never : ContextContainer<TRequestContext>;

  const handlerParams = await chainPlugins<Omit<HandlerParams<TLocals, TRequestContext, TGlobalContext>, 'params'> & AdditionalRouteParams, any>(
    plugins,
    'getErrorHandlerParams'
  )({
    ...contextParams,
    requestContext: requestContextContainer,
    globalContext: globalContextContainer as TGlobalContext extends false ? TGlobalContext extends false ? never : never : ContextContainer<TGlobalContext>,
  } as Omit<HandlerParams<TLocals, TRequestContext, TGlobalContext>, 'params'> & AdditionalRouteParams);

  await runInContext(globalContextContainer, async () => {
    return runInContext(requestContextContainer, async () => {
      try {
        result = await handler(error, handlerParams as any);
      } catch (error) {
        return next(error);
      }
    });
  });

  if (result instanceof Error) {
    return next(result);
  }

  const mappedResult = await chainPlugins(
    plugins,
    'mapResponse',
    (previousResult: ResponseDefinition) => !previousResult || previousResult.type === 'none'
  )(result, handlerParams);
  sendResponse(req, res, mappedResult as any);
};

export default {
  createErrorHandler,
  createHandler,
};
