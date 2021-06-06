export const forEachSequential = async (collection, cb, initialValue) => {
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

export const forEachParallel = async (arr, cb) => Promise.all(arr.map(cb));
