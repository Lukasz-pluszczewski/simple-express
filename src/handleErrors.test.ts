import handleErrors, { getArgs } from './handleErrors';

class Error1 extends Error {}
class Error2 extends Error {}

const errorHandler1 = () => ({ body: 'one' });
const errorHandler2 = () => ({ body: 'two' });

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
