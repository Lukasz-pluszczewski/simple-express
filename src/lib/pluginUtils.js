import { forEachSequential } from './async';

export const chainPlugins = (plugins, method, breakCondition = () => false) => async (param, ...rest) => {
  const { lastResult } = await forEachSequential(
    plugins,
    (plugin, index, previousResult) => {
      if (plugin[method] && !breakCondition(previousResult)) {
        return plugin[method](previousResult, ...rest)
      }
      return previousResult;
    },
    param
  );
  return lastResult;
};
