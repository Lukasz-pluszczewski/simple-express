// interface forEachSequential {
//   <InitialType, A>(collection: [A], cb: (value: A, key: number, previousResults: InitialType) => any, initialValue: InitialType): Promise<{ lastResult: A, results: [A] }> | { lastResult: A, results: [A] }
//   <InitialType, A, B>(collection: [A, B], cb: (value: A | B, key: number, previousResults: InitialType) => any, initialValue: InitialType): Promise<{ lastResult: B, results: [A, B] }> | { lastResult: B, results: [A, B] }
//   <InitialType, A, B, C>(collection: [A, B, C], cb: (value: A | B | C, key: number, previousResults: InitialType) => any, initialValue: InitialType): Promise<{ lastResult: C, results: [A, B, C] }> | { lastResult: C, results: [A, B, C] }
//   <InitialType, A, B, C, D>(collection: [A, B, C, D], cb: (value: A | B | C | D, key: number, previousResults: InitialType) => any, initialValue: InitialType): Promise<{ lastResult: D, results: [A, B, C, D] }> | { lastResult: D, results: [A, B, C, D] }
//   <InitialType, A, B, C, D, E>(collection: [A, B, C, D, E], cb: (value: A | B | C | D | E, key: number, previousResults: InitialType) => any, initialValue: InitialType): Promise<{ lastResult: E, results: [A, B, C, D, E] }> | { lastResult: E, results: [A, B, C, D, E] }
// }
interface forEachSequential {
  <InitialType, ReturnType>(collection: any[], cb: (value: any, key: number, previousResults: InitialType) => ReturnType, initialValue: InitialType): Promise<{ lastResult: ReturnType, results: ReturnType[] }> | { lastResult: ReturnType, results: ReturnType[] }
  // <InitialType, ReturnType, A>(collection: [A], cb: (value: A, key: number, previousResults: InitialType) => ReturnType, initialValue: InitialType): Promise<{ lastResult: ReturnType, results: ReturnType[] }> | { lastResult: ReturnType, results: ReturnType[] }
  // <InitialType, ReturnType, A, B>(collection: [A, B], cb: (value: A | B, key: number, previousResults: InitialType) => ReturnType, initialValue: InitialType): Promise<{ lastResult: ReturnType, results: ReturnType[] }> | { lastResult: ReturnType, results: ReturnType[] }
  // <InitialType, ReturnType, A, B, C>(collection: [A, B, C], cb: (value: A | B | C, key: number, previousResults: InitialType) => ReturnType, initialValue: InitialType): Promise<{ lastResult: ReturnType, results: ReturnType[] }> | { lastResult: ReturnType, results: ReturnType[] }
  // <InitialType, ReturnType, A, B, C, D>(collection: [A, B, C, D], cb: (value: A | B | C | D, key: number, previousResults: InitialType) => ReturnType, initialValue: InitialType): Promise<{ lastResult: ReturnType, results: ReturnType[] }> | { lastResult: ReturnType, results: ReturnType[] }
  // <InitialType, ReturnType, A, B, C, D, E>(collection: [A, B, C, D, E], cb: (value: A | B | C | D | E, key: number, previousResults: InitialType) => ReturnType, initialValue: InitialType): Promise<{ lastResult: ReturnType, results: ReturnType[] }> | { lastResult: ReturnType, results: ReturnType[] }
}

export const forEachSequential: forEachSequential = async (collection, cb, initialValue) => {
  const results = [];
  let previousResult = initialValue;

  for (const key in collection) {
    if (collection.hasOwnProperty(key)) {
      previousResult = await cb(collection[key], key, previousResult);
      results.push(previousResult);
    }
  }

  return { lastResult: previousResult, results };
};

// const results = forEachSequential(
//   [
//     '1',
//     '2',
//     '3'
//   ],
//   (el: string, key: number, previous: number) => parseInt(el) + previous,
//   0,
// );

// const results = forEachSequential(
//   [
//     { foo: 'foo' },
//     { bar: 'bar' },
//     { baz: 'baz' }
//   ],
//   (el: Record<string, string>, key: number, previous: Record<string, string>) => ({ ...previous, ...el }),
//   {},
// );

// const results = forEachSequential(
//   [
//     1,
//     'string',
//     { foo: 'foo' }
//   ],
//   (el: number | string | Record<string, string>, key: number, previous: Record<string, string>) => el,
//   {},
// );
