import { asyncReduce } from "../utils/asyncCollections";

import { Plugin } from '../types';

type Method = keyof ReturnType<Plugin>;

export const chainPlugins = <InitialType, ResultType>(
  plugins: ReturnType<Plugin>[],
  method: Method,
  breakCondition: (previousResult: unknown) => boolean = () => false,
) =>
  async (param: InitialType, ...rest: [...unknown[]]) => {
    const lastResult = await asyncReduce<ReturnType<Plugin>, Record<string, any>>(
      plugins,
      async (previousResult: Record<string, any>, plugin, index) => {
        if (plugin[method] && !breakCondition(previousResult)) {
          return plugin[method](previousResult, ...rest);
        }
        return previousResult;
      },
      param
    );
    return lastResult as ResultType;
  };
