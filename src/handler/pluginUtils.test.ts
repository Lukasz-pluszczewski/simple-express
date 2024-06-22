import { chainPlugins } from './pluginUtils';
import { Plugin } from '../types';

const pluginFoo: ReturnType<Plugin> = {
  getHandlerParams: (previous) => ({ ...previous, foo: 'fooValue' }),
}
const pluginBar: ReturnType<Plugin> = {
  getHandlerParams: (previous) => ({ ...previous, bar: 'barValue' }),
}

describe('pluginUtils', () => {
  describe('chainPlugins', () => {
    it('should chain plugins', async () => {
      const results =await chainPlugins(
        [
          pluginFoo,
          pluginBar,
        ],
        'getHandlerParams',
      )({
        test: 'testValue',
      });

      expect(results).toEqual({ foo: 'fooValue', bar: 'barValue', test: 'testValue' });
    });
  });
});
