import {
  asyncMap,
  asyncForEach,
  asyncReduce,
  asyncFilter,

  asyncMapValues,
  asyncMapKeys,
  asyncMapEntries,

  asyncForEachValues,
  asyncForEachKeys,
  asyncForEachEntries,

  asyncReduceValues,
  asyncReduceKeys,
  asyncReduceEntries,

  asyncFilterValues,
  asyncFilterKeys,
  asyncFilterEntries,

  asyncMapParallel,
  asyncForEachParallel,
  asyncFilterParallel,

  asyncMapValuesParallel,
  asyncMapKeysParallel,
  asyncMapEntriesParallel,

  asyncForEachValuesParallel,
  asyncForEachKeysParallel,
  asyncForEachEntriesParallel,

  asyncFilterValuesParallel,
  asyncFilterKeysParallel,
  asyncFilterEntriesParallel,

  Break,
  Last,
} from './asyncCollections';

describe('asyncCollections', () => {
  describe('asyncMap', () => {
    it('should map values', async () => {
      const result = await asyncMap([1, 2, 3], async (value) => value * 2);
      expect(result).toEqual([2, 4, 6]);
    });

    it('should break on encountering Break', async () => {
      const result = await asyncMap([1, 2, 3], async (value) => {
        if (value === 2) return Break;
        return value * 2;
      });
      expect(result).toEqual([2]);
    });

    it('should save value and break on encountering Last', async () => {
      const result = await asyncMap([1, 2, 3], async (value) => {
        if (value === 2) return Last(value * 10);
        return value * 2;
      });
      expect(result).toEqual([2, 20]);
    });
  });

  describe('asyncForEach', () => {
    it('should loop over values', async () => {
      const mockCallback = vi.fn();
      const data = [1, 2, 3];
      await asyncForEach(data, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback.mock.calls).toEqual([[1, 0, data], [2, 1, data], [3, 2, data]]);
    });

    it('should break on encountering Break', async () => {
      const mockCallback: any = vi.fn(async (value: number) => {
        if (value === 2) return Break;
      });
      const data = [1, 2, 3];
      await asyncForEach(data, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback.mock.calls).toEqual([[1, 0, data], [2, 1, data]]);
    });
  });

  describe('asyncReduce', () => {
    it('should reduce values', async () => {
      const result = await asyncReduce(
        [1, 2, 3],
        async (acc, value) => acc + value,
        0
      );
      expect(result).toBe(6);
    });

    it('should break and save value on encountering Last', async () => {
      const result = await asyncReduce(
        [1, 2, 3],
        async (acc, value) => {
          if (value === 2) return Last(acc + value * 10);
          return acc + value;
        },
        0
      );
      expect(result).toBe(21);
    });
  });

  describe('asyncFilter', () => {
    it('should filter values', async () => {
      const result = await asyncFilter([1, 2, 3], async (value) => value < 3);
      expect(result).toEqual([1, 2]);
    });

    it('should break on encountering Break', async () => {
      const result = await asyncFilter([1, 2, 3], async (value) => {
        if (value === 2) return Break;
        return true;
      });
      expect(result).toEqual([1]);
    });

    it('should save value and break on encountering Last #1', async () => {
      const result = await asyncFilter([1, 2, 3], async (value) => {
        if (value === 2) return Last(true);
        return true;
      });
      expect(result).toEqual([1, 2]);
    });

    it('should save value and break on encountering Last #2', async () => {
      const result = await asyncFilter([1, 2, 3], async (value) => {
        if (value === 2) return Last(false);
        return true;
      });
      expect(result).toEqual([1]);
    });
  });

  describe('asyncMapValues', () => {
    it('should map object values', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapValues(obj, async (value) => value * 2);
      expect(result).toEqual({ a: 2, b: 4, c: 6 });
    });

    it('should break on encountering Break', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapValues(obj, async (value, key) => {
        if (key === 'b') return Break;
        return value * 2;
      });
      expect(result).toEqual({ a: 2 });
    });

    it('should save value and break on encountering Last', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapValues(obj, async (value, key) => {
        if (key === 'b') return Last(value * 10);
        return value * 2;
      });
      expect(result).toEqual({ a: 2, b: 20 });
    });
  });

  describe('asyncMapParallel', () => {
    it('should map values in parallel', async () => {
      const result = await asyncMapParallel([1, 2, 3], async (value) => value * 2);
      expect(result).toEqual([2, 4, 6]);
    });
  });

  describe('asyncFilterParallel', () => {
    it('should filter values in parallel', async () => {
      const result = await asyncFilterParallel([1, 2, 3], async (value) => value < 3);
      expect(result).toEqual([1, 2]);
    });
  });

  describe('asyncMapEntries', () => {
    it('should map object entries', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapEntries(obj, async ([key, value]) => `${key}:${value}`);
      expect(result).toEqual(['a:1', 'b:2', 'c:3']);
    });

    it('should break on encountering Break', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapEntries(obj, async ([key, value]) => {
        if (key === 'b') return Break;
        return `${key}:${value}`;
      });
      expect(result).toEqual(['a:1']);
    });

    it('should save value and break on encountering Last', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapEntries(obj, async ([key, value]) => {
        if (key === 'b') return Last(`${key}:${value}`);
        return `${key}:${value}`;
      });
      expect(result).toEqual(['a:1', 'b:2']);
    });
  });

  describe('asyncMapKeys', () => {
    it('should map object keys', async () => {
      const obj: Record<string, number> = { a: 1, b: 2, c: 3 };
      const result = await asyncMapKeys(obj, async (key) => key.toUpperCase());
      expect(result).toEqual(['A', 'B', 'C']);
    });

    it('should break on encountering Break', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapKeys(obj, async (key) => {
        if (key === 'b') return Break;
        return key;
      });
      expect(result).toEqual(['a']);
    });

    it('should save value and break on encountering Last', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapKeys(obj, async (key) => {
        if (key === 'b') return Last(key);
        return key;
      });
      expect(result).toEqual(['a', 'b']);
    });
  });

  describe('asyncForEachValues', () => {
    it('should loop over object values', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const mockCallback = vi.fn();
      await asyncForEachValues(obj, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback.mock.calls).toEqual([[1, 'a', obj], [2, 'b', obj], [3, 'c', obj]]);
    });

    it('should break on encountering Break', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const mockCallback: any = vi.fn(async (value: number) => {
        if (value === 2) return Break;
      });
      await asyncForEachValues(obj, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback.mock.calls).toEqual([[1, 'a', obj], [2, 'b', obj]]);
    });
  });

  describe('asyncForEachEntries', () => {
    it('should loop over object entries', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const mockCallback = vi.fn();
      await asyncForEachEntries(obj, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback.mock.calls).toEqual([
        [['a', 1], 0, [['a', 1], ['b', 2], ['c', 3]]],
        [['b', 2], 1, [['a', 1], ['b', 2], ['c', 3]]],
        [['c', 3], 2, [['a', 1], ['b', 2], ['c', 3]]],
      ]);
    });

    it('should break on encountering Break', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const mockCallback: any = vi.fn(async ([, value]: [string, number]) => {
        if (value === 2) return Break;
      });
      await asyncForEachEntries(obj, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback.mock.calls).toEqual([
        [['a', 1], 0, [['a', 1], ['b', 2], ['c', 3]]],
        [['b', 2], 1, [['a', 1], ['b', 2], ['c', 3]]],
      ]);
    });
  });

  describe('asyncForEachKeys', () => {
    it('should loop over object keys', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const mockCallback = vi.fn();
      await asyncForEachKeys(obj, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback.mock.calls).toEqual([
        ['a', 0, ['a', 'b', 'c']],
        ['b', 1, ['a', 'b', 'c']],
        ['c', 2, ['a', 'b', 'c']],
      ]);
    });

    it('should break on encountering Break', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const mockCallback: any = vi.fn(async (value: string) => {
        if (value === 'b') return Break;
      });
      await asyncForEachKeys(obj, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback.mock.calls).toEqual([['a', 0, ['a', 'b', 'c']], ['b', 1, ['a', 'b', 'c']]]);
    });
  });

  describe('asyncReduceValues', () => {
    it('should reduce object values', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncReduceValues(obj, async (acc, value) => acc + value, 0);
      expect(result).toBe(6);
    });

    it('should break and save value on encountering Last', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncReduceValues(obj, async (acc, value, key) => {
        if (key === 'b') return Last(acc + value * 10);
        return acc + value;
      }, 0);
      expect(result).toBe(21);
    });
  });

  describe('asyncReduceEntries', () => {
    it('should reduce object entries', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncReduceEntries(obj, async (acc, [key, value]) => acc + value, 0);
      expect(result).toBe(6);
    });

    it('should break and save value on encountering Last', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncReduceEntries(obj, async (acc, [key, value]) => {
        if (key === 'b') return Last(acc + key);
        return acc + key;
      }, '');
      expect(result).toBe('ab');
    });
  });

  describe('asyncReduceKeys', () => {
    it('should reduce object keys', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncReduceKeys(obj, async (acc, key) => acc + key, '');
      expect(result).toBe('abc');
    });

    it('should break and save value on encountering Last', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncReduceKeys(obj, async (acc, key) => {
        if (key === 'b') return Last(acc + key);
        return acc + key;
      }, '');
      expect(result).toBe('ab');
    });
  });

  describe('asyncFilterValues', () => {
    it('should filter object values', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterValues(obj, async (value) => value < 3);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should break on encountering Break', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterValues(obj, async (value, key) => {
        if (key === 'b') return Break;
        return true;
      });
      expect(result).toEqual({ a: 1 });
    });

    it('should save value and break on encountering Last #1', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterValues(obj, async (value, key) => {
        if (key === 'b') return Last(true);
        return true;
      });
      expect(result).toEqual({ a: 1, b: 2 });
    });
    it('should save value and break on encountering Last #2', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterValues(obj, async (value, key) => {
        if (key === 'b') return Last(false);
        return true;
      });
      expect(result).toEqual({ a: 1 });
    });
  });

  describe('asyncFilterKeys', () => {
    it('should filter object keys', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterKeys(obj, async (key) => key !== 'b');
      expect(result).toEqual(['a', 'c']);
    });

    it('should break on encountering Break', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterKeys(obj, async (key) => {
        if (key === 'b') return Break;
        return true;
      });
      expect(result).toEqual(['a']);
    });

    it('should save value and break on encountering Last #1', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterKeys(obj, async (key) => {
        if (key === 'b') return Last(true);
        return true;
      });
      expect(result).toEqual(['a', 'b']);
    });
    it('should save value and break on encountering Last #2', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterKeys(obj, async (key) => {
        if (key === 'b') return Last(false);
        return true;
      });
      expect(result).toEqual(['a']);
    });
  });

  describe('asyncFilterEntries', () => {
    it('should filter object entries', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterEntries(obj, async ([key, value]) => value < 3);
      expect(result).toEqual([['a', 1], ['b', 2]]);
    });

    it('should break on encountering Break', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterEntries(obj, async ([key, value]) => {
        if (key === 'b') return Break;
        return true;
      });
      expect(result).toEqual([['a', 1]]);
    });

    it('should save value and break on encountering Last #1', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterEntries(obj, async ([key, value]) => {
          if (key === 'b') return Last(true);
          return true;
        }
      );
      expect(result).toEqual([['a', 1], ['b', 2]]);
    });

    it('should save value and break on encountering Last #2', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterEntries(obj, async ([key, value]) => {
        if (key === 'b') return Last(false);
        return true;
      });
      expect(result).toEqual([['a', 1]]);
    });
  });

  describe('asyncForEachParallel', () => {
    it('should loop over values in parallel', async () => {
      const mockCallback = vi.fn();
      await asyncForEachParallel([1, 2, 3], mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('asyncMapValuesParallel', () => {
    it('should map object values in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapValuesParallel(obj, async (value) => value * 2);
      expect(result).toEqual({ a: 2, b: 4, c: 6 });
    });
  });

  describe('asyncMapEntriesParallel', () => {
    it('should map object entries in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapEntriesParallel(obj, async ([key, value]) => `${key}:${value}`);
      expect(result).toEqual(['a:1', 'b:2', 'c:3']);
    });
  });

  describe('asyncMapKeysParallel', () => {
    it('should map object keys in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncMapKeysParallel(obj, async (key) => key.toUpperCase());
      expect(result).toEqual(['A', 'B', 'C']);
    });
  });

  describe('asyncForEachValuesParallel', () => {
    it('should loop over object values in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const mockCallback = vi.fn();
      await asyncForEachValuesParallel(obj, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('asyncForEachEntriesParallel', () => {
    it('should loop over object entries in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const mockCallback = vi.fn();
      await asyncForEachEntriesParallel(obj, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('asyncForEachKeysParallel', () => {
    it('should loop over object keys in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const mockCallback = vi.fn();
      await asyncForEachKeysParallel(obj, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('asyncFilterValuesParallel', () => {
    it('should filter object values in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterValuesParallel(obj, async (value) => value < 3);
      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe('asyncFilterKeysParallel', () => {
    it('should filter object keys in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterKeysParallel(obj, async (key) => key !== 'b');
      expect(result).toEqual(['a', 'c']);
    });
  });

  describe('asyncFilterEntriesParallel', () => {
    it('should filter object entries in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = await asyncFilterEntriesParallel(obj, async ([key, value]) => value < 3);
      expect(result).toEqual([['a', 1], ['b', 2]]);
    });
  });
});
