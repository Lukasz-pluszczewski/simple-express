import { AsyncLocalStorage } from 'node:async_hooks';

import {
  ContextContainer,
  GlobalContextConfig,
  HandlerParams,
  RequestContextConfig,
} from '../types';

export const createContextContainer = <
  TContext extends Record<string, unknown> = Record<string, never>,
>(
  asyncLocalStorage: AsyncLocalStorage<TContext>,
  initialData: TContext
): ContextContainer<TContext> => {
  return {
    get: <TKey extends keyof TContext>(key: TKey) => {
      const store = asyncLocalStorage.getStore();
      if (!store) {
        return undefined;
      }
      return store[key] ?? undefined;
    },
    set: <TKey extends keyof TContext>(key: TKey, value: TContext[TKey]) => {
      const store = asyncLocalStorage.getStore();
      if (!store) {
        return;
      }
      return (store[key] = value);
    },
    nativeLocalStorage: asyncLocalStorage,
    run: async <TParams extends unknown[]>(
      fn: (...params: TParams) => Promise<void>,
      ...params: TParams
    ) => {
      await asyncLocalStorage.run(initialData, () => {
        return fn(...params);
      });
    },
  };
};

export const RequestContextContainer = <
  RequestContext extends Record<string, unknown> = Record<string, never>,
  AdditionalRouteParams extends Record<string, unknown> = Record<string, never>,
  TLocals extends Record<string, unknown> = Record<string, never>,
>(
  asyncLocalStorage: AsyncLocalStorage<RequestContext>,
  handlerParams: HandlerParams<TLocals> & AdditionalRouteParams,
  initialDataFactory: RequestContextConfig<
    RequestContext,
    AdditionalRouteParams,
    TLocals
  >
): ContextContainer<RequestContext> => {
  return createContextContainer(
    asyncLocalStorage,
    initialDataFactory(handlerParams)
  );
};

export const GlobalContextContainer = <
  GlobalContext extends Record<string, unknown> = Record<string, never>,
>(
  asyncLocalStorage: AsyncLocalStorage<GlobalContext>,
  initialData: GlobalContextConfig<GlobalContext>
): ContextContainer<GlobalContext> => {
  return createContextContainer(asyncLocalStorage, initialData);
};

export const runInContext = <TParams extends unknown[]>(
  contextContainer: ContextContainer<any>,
  fn: (...params: TParams) => Promise<void>,
  ...params: TParams
) => {
  if (contextContainer) {
    return contextContainer.run(fn, ...params);
  }
  return fn(...params);
};

export const createGetRequestContext =
  <RequestContext extends Record<string, unknown> = Record<string, never>>(
    asyncLocalStorage: AsyncLocalStorage<RequestContext>
  ) =>
  () => {
    return {
      get: <TKey extends keyof RequestContext>(key: TKey) => {
        const store = asyncLocalStorage.getStore();
        if (!store) {
          return undefined;
        }
        return store[key] ?? undefined;
      },
      set: <TKey extends keyof RequestContext>(
        key: TKey,
        value: RequestContext[TKey]
      ) => {
        const store = asyncLocalStorage.getStore();
        if (!store) {
          return;
        }
        return (store[key] = value);
      },
      nativeLocalStorage: asyncLocalStorage,
    };
  };

export const createGetGlobalContext =
  <GlobalContext extends Record<string, unknown> = Record<string, never>>(
    asyncLocalStorage: AsyncLocalStorage<GlobalContext>
  ) =>
  () => {
    return {
      get: <TKey extends keyof GlobalContext>(key: TKey) => {
        const store = asyncLocalStorage.getStore();
        if (!store) {
          return undefined;
        }
        return store[key] ?? undefined;
      },
      set: <TKey extends keyof GlobalContext>(
        key: TKey,
        value: GlobalContext[TKey]
      ) => {
        const store = asyncLocalStorage.getStore();
        if (!store) {
          return;
        }
        return (store[key] = value);
      },
      nativeLocalStorage: asyncLocalStorage,
    };
  };
