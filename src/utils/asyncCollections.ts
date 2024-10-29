type ObjectKey = string | number | symbol;
type ObjectEntry<T> = [string, T];
export const Break = Symbol('BreakSymbol');
type BreakSymbol = typeof Break;

class LastClass<T> {
  constructor(public value: T) {}
}
export const Last = <T>(value: T) => new LastClass(value);


// --- async sequential - array ---
export async function asyncMap<T, U>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<U | BreakSymbol | LastClass<U>>): Promise<U[]> {
  const result: U[] = [];
  for (let i = 0; i < array.length; i++) {
    const iterationResult = await callback(array[i], i, array);
    if (iterationResult === Break) {
      break;
    }
    if (iterationResult instanceof LastClass) {
      result.push(iterationResult.value);
      break;
    }
    result.push(iterationResult);
  }
  return result;
}

export async function asyncForEach<T>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<void | BreakSymbol>): Promise<void> {
  for (let i = 0; i < array.length; i++) {
    const iterationResult = await callback(array[i], i, array);
    if (iterationResult === Break) {
      break;
    }
  }
}

export async function asyncReduce<T, U>(array: T[], callback: (accumulator: U, value: T, index: number, array: T[]) => Promise<U | LastClass<U>>, initialValue?: U): Promise<U> {
  let accumulator = initialValue;
  for (let i = 0; i < array.length; i++) {
    const iterationResult = await callback(accumulator as U, array[i], i, array);
    if (iterationResult instanceof LastClass) {
      accumulator = iterationResult.value;
      break;
    }
    accumulator = iterationResult;
  }
  return accumulator as U;
}

export async function asyncFilter<T>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<boolean | LastClass<boolean> | BreakSymbol>): Promise<T[]> {
  const result: T[] = [];
  await asyncForEach(array, async (value, index, array) => {
    const iterationResult = await callback(value, index, array);
    if (iterationResult instanceof LastClass) {
      if (iterationResult.value) {
        result.push(value);
      }
      return Break;
    }
    if (iterationResult === Break) {
      return Break;
    }
    if (iterationResult) {
      result.push(value);
    }
  });

  return result;
};

// --- async sequential - object ---
export async function asyncMapValues<T, U>(object: Record<ObjectKey, T>, callback: (value: T, key: string, object: Record<ObjectKey, T>) => Promise<U | BreakSymbol | LastClass<U>>): Promise<Record<string, U>> {
  const result: Record<string, U> = {};
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const iterationResult = await callback(object[key], key, object);
      if (iterationResult === Break) {
        break;
      }
      if (iterationResult instanceof LastClass) {
        result[key] = iterationResult.value;
        break;
      }
      result[key] = iterationResult;
    }
  }
  return result;
}

export async function asyncMapEntries<T, U>(object: Record<ObjectKey, T>, callback: (entry: ObjectEntry<T>, index: number, entries: ObjectEntry<T>[]) => Promise<U | BreakSymbol | LastClass<U>>): Promise<U[]> {
  return asyncMap(Object.entries(object), callback);
}

export async function asyncMapKeys<T, U>(object: Record<ObjectKey, T>, callback: (key: string, index: number, keys: string[]) => Promise<U | BreakSymbol | LastClass<U>>): Promise<U[]> {
  return asyncMap(Object.keys(object), callback);
}

export async function asyncForEachValues<T>(object: Record<ObjectKey, T>, callback: (value: T, key: string, object: Record<ObjectKey, T>) => Promise<void | BreakSymbol>): Promise<void> {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const iterationResult = await callback(object[key], key, object);
      if (iterationResult === Break) {
        break;
      }
    }
  }
}

export async function asyncForEachEntries<T>(object: Record<ObjectKey, T>, callback: (entry: ObjectEntry<T>, index: number, entries: ObjectEntry<T>[]) => Promise<void | BreakSymbol>): Promise<void> {
  await asyncForEach(Object.entries(object), callback);
}

export async function asyncForEachKeys<T>(object: Record<ObjectKey, T>, callback: (key: string, index: number, keys: string[]) => Promise<void | BreakSymbol>): Promise<void> {
  await asyncForEach(Object.keys(object), callback);
}

export async function asyncReduceValues<T, U>(object: Record<ObjectKey, T>, callback: (accumulator: U, value: T, key: string, object: Record<ObjectKey, T>) => Promise<U | LastClass<U>>, initialValue?: U): Promise<U> {
  let accumulator = initialValue;
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const iterationResult = await callback(accumulator as U, object[key], key, object);
      if (iterationResult instanceof LastClass) {
        accumulator = iterationResult.value;
        break;
      }
      accumulator = iterationResult;
    }
  }
  return accumulator as U;
}

export async function asyncReduceEntries<T, U>(object: Record<ObjectKey, T>, callback: (accumulator: U, entry: ObjectEntry<T>, index: number, entries: ObjectEntry<T>[]) => Promise<U | LastClass<U>>, initialValue?: U): Promise<U> {
  return asyncReduce(Object.entries(object), callback, initialValue);
}

export async function asyncReduceKeys<T, U>(object: Record<ObjectKey, T>, callback: (accumulator: U, key: string, index: number, keys: string[]) => Promise<U | LastClass<U>>, initialValue?: U): Promise<U> {
  return asyncReduce(Object.keys(object), callback, initialValue);
}

export async function asyncFilterValues<T>(object: Record<ObjectKey, T>, callback: (value: T, key: string, object: Record<ObjectKey, T>) => Promise<boolean | LastClass<boolean> | BreakSymbol>): Promise<Record<string, T>> {
  const result: Record<string, T> = {};
  await asyncForEachValues(object, async (value, key, object) => {
    const iterationResult = await callback(value, key, object);
    if (iterationResult instanceof LastClass) {
      if (iterationResult.value) {
        result[key] = value;
      }
      return Break;
    }
    if (iterationResult === Break) {
      return Break;
    }
    if (iterationResult) {
      result[key] = value;
    }
  });

  return result;
}

export async function asyncFilterKeys<T>(object: Record<ObjectKey, T>, callback: (key: string, index: number, keys: string[]) => Promise<boolean | LastClass<boolean> | BreakSymbol>): Promise<string[]> {
  return asyncFilter(Object.keys(object), callback);
}

export async function asyncFilterEntries<T>(object: Record<ObjectKey, T>, callback: (entry: ObjectEntry<T>, index: number, entries: ObjectEntry<T>[]) => Promise<boolean | LastClass<boolean> | BreakSymbol>): Promise<ObjectEntry<T>[]> {
  return asyncFilter(Object.entries(object), callback);
}


// --- async parallel - array ---
export async function asyncMapParallel<T, U>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<U>): Promise<U[]> {
  return Promise.all(array.map(callback));
}

export async function asyncForEachParallel<T>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<void>): Promise<void> {
  await Promise.all(array.map(callback));
}

export async function asyncFilterParallel<T>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<T[]> {
  const result = await Promise.all(array.map(callback));
  return array.filter((_, index) => result[index]);
}

// --- async parallel - object ---
export async function asyncMapValuesParallel<T, U>(object: Record<ObjectKey, T>, callback: (value: T, key: string, object: Record<ObjectKey, T>) => Promise<U>): Promise<Record<string, U>> {
  const result: Record<ObjectKey, U> = {};
  await Promise.all(Object.keys(object).map(async (key) => {
    result[key] = await callback(object[key], key, object);
  }));
  return result;
}

export async function asyncMapEntriesParallel<T, U>(object: Record<ObjectKey, T>, callback: (entry: ObjectEntry<T>, index: number, entries: ObjectEntry<T>[]) => Promise<U>): Promise<U[]> {
  const entries = Object.entries(object);
  return asyncMapParallel(entries, callback);
}

export async function asyncMapKeysParallel<T, U>(object: Record<ObjectKey, T>, callback: (key: string, index: number, keys: string[]) => Promise<U>): Promise<U[]> {
  const keys = Object.keys(object);
  return asyncMapParallel(keys, callback);
}

export async function asyncForEachValuesParallel<T>(object: Record<ObjectKey, T>, callback: (value: T, key: string, object: Record<ObjectKey, T>) => Promise<void>): Promise<void> {
  await Promise.all(Object.keys(object).map(async (key) => {
    await callback(object[key], key, object);
  }));
}

export async function asyncForEachEntriesParallel<T>(object: Record<ObjectKey, T>, callback: (entry: ObjectEntry<T>, index: number, entries: ObjectEntry<T>[]) => Promise<void>): Promise<void> {
  const entries = Object.entries(object);
  await asyncForEachParallel(entries, callback);
}

export async function asyncForEachKeysParallel<T>(object: Record<ObjectKey, T>, callback: (key: string, index: number, keys: string[]) => Promise<void>): Promise<void> {
  const keys = Object.keys(object);
  await asyncForEachParallel(keys, callback);
}

export async function asyncFilterValuesParallel<T>(object: Record<ObjectKey, T>, callback: (value: T, key: string, object: Record<ObjectKey, T>) => Promise<boolean>): Promise<Record<string, T>> {
  const result: Record<string, T> = {};
  await Promise.all(Object.keys(object).map(async (key) => {
    if (await callback(object[key], key, object)) {
      result[key] = object[key];
    }
  }));
  return result;
}

export async function asyncFilterKeysParallel<T>(object: Record<ObjectKey, T>, callback: (key: string, index: number, keys: string[]) => Promise<boolean>): Promise<string[]> {
  const keys = Object.keys(object);
  const result = await Promise.all(keys.map(async (key, index) => {
    if (await callback(key, index, keys)) {
      return key;
    }
  }));
  return result.filter(Boolean) as string[];
}

export async function asyncFilterEntriesParallel<T>(object: Record<ObjectKey, T>, callback: (entry: ObjectEntry<T>, index: number, entries: ObjectEntry<T>[]) => Promise<boolean>): Promise<ObjectEntry<T>[]> {
  const entries = Object.entries(object);
  const result = await Promise.all(entries.map(async (entry, index) => {
    if (await callback(entry, index, entries)) {
      return entry;
    }
  }));
  return result.filter(Boolean) as ObjectEntry<T>[];
}
