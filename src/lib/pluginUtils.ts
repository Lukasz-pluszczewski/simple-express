import { forEachSequential } from "./async";

import { HandlerParams, Plugin, RouteParams } from './types';
import { NextFunction, Request, Response } from "express";

type Method = keyof ReturnType<Plugin>;
type PluginFunction<InputType, ReturnType> = { getHandlerParams: (params: InputType) => ReturnType }

interface chainPlugins {
  <InputType, A>(plugins: [
    PluginFunction<InputType, A>,
  ], method: Method, breakCondition: (previousResults: InputType | A) => boolean, initial: InputType): A
  <InputType, A, B>(plugins: [
    PluginFunction<InputType, A>,
    PluginFunction<A, B>,
  ], method: Method, breakCondition: (previousResults: InputType | A | B) => boolean, initial: InputType): B
  <InputType, A, B, C>(plugins: [
    PluginFunction<InputType, A>,
    PluginFunction<A, B>,
    PluginFunction<B, C>,
  ], method: Method, breakCondition: (previousResults: InputType | A | B | C) => boolean, initial: InputType): C
  <InputType, A, B, C, D>(plugins: [
    PluginFunction<InputType, A>,
    PluginFunction<A, B>,
    PluginFunction<B, C>,
    PluginFunction<C, D>,
  ], method: Method, breakCondition: (previousResults: InputType | A | B | C | D) => boolean, initial: InputType): D
  <InputType, A, B, C, D, E>(plugins: [
    PluginFunction<InputType, A>,
    PluginFunction<A, B>,
    PluginFunction<B, C>,
    PluginFunction<C, D>,
    PluginFunction<D, E>,
  ], method: Method, breakCondition: (previousResults: InputType | A | B | C | D | E) => boolean, initial: InputType): E
};

// export const chainPlugins =
//   (plugins: ReturnType<Plugin>[], method: Method, breakCondition = () => false) =>
//   async (param, ...rest) => {
//     const { lastResult } = await forEachSequential(
//       plugins,
//       (plugin, index, previousResult) => {
//         if (plugin[method] && !breakCondition(previousResult)) {
//           return plugin[method](previousResult, ...rest);
//         }
//         return previousResult;
//       },
//       param
//     );
//     return lastResult;
//   };

export const chainPlugins: chainPlugins =
  async (plugins: ReturnType<Plugin>[], method: Method, breakCondition = () => false, param) => {
    const { lastResult } = await forEachSequential(
      plugins,
      (plugin, index, previousResult) => {
        if (plugin[method] && !breakCondition(previousResult)) {
          return plugin[method](previousResult);
        }
        return previousResult;
      },
      param
    );
    return lastResult;
  };


// test
const initialHandlerParams = {
  body: {},
  // query: {},
  // params: {},
  // method: 'GET',
  // originalUrl: 'lala',
  // protocol: 'http',
  // xhr: false,
  // getHeader: ((name: string) => 'lalala') as Request['get'],
  // get: ((name: string) => 'lalala') as Request['get'],
  // locals: {},
  // next: (() => {}) as NextFunction,
  // req: {} as unknown as (Request & { requestTiming?: number }),
  // res: {} as unknown as Response,
}
const plugins = [
  {
    getHandlerParams: <T>(params: T) => {
      return {
        ...params,
        foo: 'foo',
      };
    },
  },
  {
    getHandlerParams: (params: { body: Record<string, any>, foo: string }) => {
      return {
        ...params,
        bar: 'bar',
      };
    },
  }
] as const;

(async () => {
  const result = await chainPlugins(
    [
      {
        getHandlerParams: (params) => {
          return {
            ...params,
            foo: 'foo',
          } as { body: Record<string, any>, foo: string };
        },
      },
      {
        getHandlerParams: (params) => {
          return {
            ...params,
            foo: 'foo',
          };
        },
      },
      {
        getHandlerParams: (params: { body: Record<string, any>, foo: string }) => {
          return {
            ...params,
            bar: 'bar',
          };
        },
      }
    ],
    'getHandlerParams',
    () => false,
    initialHandlerParams
  );


})();

