import { Plugin } from '../types';
import { asyncReduce } from '../utils/asyncCollections';

type Method = keyof ReturnType<Plugin>;

// TODO: make plugins typesafe
export const chainPlugins =
  <InitialType, ResultType>(
    plugins: ReturnType<Plugin>[],
    method: Method,
    breakCondition: (previousResult: unknown) => boolean = () => false
  ) =>
  async (param: InitialType, ...rest: [...unknown[]]) => {
    const lastResult = await asyncReduce<
      ReturnType<Plugin>,
      Record<string, any>
    >(
      plugins,
      async (previousResult: Record<string, any>, plugin, index) => {
        if (plugin[method] && !breakCondition(previousResult)) {
          return (plugin[method] as any)(previousResult, ...rest);
        }
        return previousResult;
      },
      param
    );
    return lastResult as ResultType;
  };
