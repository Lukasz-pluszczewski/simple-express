import handleErrors, { getArgs } from './handleErrors';

class Error1 extends Error {}
class Error2 extends Error {}

const errorHandler1 = () => ({ body: 'one' });
const errorHandler2 = () => ({ body: 'two' });

class InferenceError1 extends Error {
  field1 = 'field1' as const;
}
class InferenceError2 extends Error {
  field2 = 'field2' as const;
}
class InferenceError3 extends Error {
  field3 = 'field3' as const;
}

// compile-time only type assertions
const _typeAssertions = () => {
  handleErrors(InferenceError1, (error) => {
    error.field1;
    // @ts-expect-error field2 is not on InferenceError1
    error.field2;

    return { body: 'ok' };
  });

  handleErrors([InferenceError1, InferenceError2], (error) => {
    if ('field1' in error) {
      error.field1;
    }
    if ('field2' in error) {
      error.field2;
    }
    // @ts-expect-error field3 is outside inferred union
    error.field3;

    return { body: 'ok' };
  });

  handleErrors([
    [[InferenceError1, InferenceError2], (error) => {
      if ('field1' in error) {
        error.field1;
      }
      if ('field2' in error) {
        error.field2;
      }
      // @ts-expect-error field3 is outside inferred union
      error.field3;

      return { body: 'ok' };
    }],
  ]);

  handleErrors([
    [InferenceError1, (error) => {
      error.field1;
      // @ts-expect-error field2 is not on InferenceError1
      error.field2;

      return { body: 'one' };
    }],
    [[InferenceError2, InferenceError3], (error) => {
      if ('field2' in error) {
        error.field2;
      }
      if ('field3' in error) {
        error.field3;
      }
      // @ts-expect-error field1 is outside this tuple's union
      error.field1;

      return { body: 'two' };
    }],
  ]);
};

describe('getArgs', () => {
  it('should return correct args', () => {
    expect(getArgs([Error1, errorHandler1])).toEqual([[Error1, errorHandler1]]);

    expect(getArgs([[[Error1, errorHandler1]]])).toEqual([
      [Error1, errorHandler1],
    ]);

    expect(
      getArgs([
        [
          [Error1, errorHandler1],
          [Error2, errorHandler2],
        ],
      ])
    ).toEqual([
      [Error1, errorHandler1],
      [Error2, errorHandler2],
    ]);

    expect(getArgs([[[Error1, errorHandler1], errorHandler2]])).toEqual([
      [Error1, errorHandler1],
      [null, errorHandler2],
    ]);

    expect(getArgs([[[Error1, errorHandler1], [errorHandler2]]])).toEqual([
      [Error1, errorHandler1],
      [null, errorHandler2],
    ]);

    expect(
      getArgs([[[[Error1, Error2], errorHandler1], [errorHandler2]]])
    ).toEqual([
      [Error1, errorHandler1],
      [Error2, errorHandler1],
      [null, errorHandler2],
    ]);
  });
});
