import request from 'supertest';
import freePort from 'find-free-port';
import simpleExpress, { ValidationError, checkPropTypes, wrapMiddleware, handleError } from '../index';
import PropTypes from 'prop-types';

import { routeStyles } from './testData/routes';

describe('simpleExpress', () => {
  let freePorts = [];
  const getFreePort = () => freePorts.shift();
  beforeAll(async () => {
    const numberOfPortsNeeded = 20;

    try {
      const ports = await freePort(9000, 9100, '127.0.0.1', numberOfPortsNeeded);
      freePorts = ports;
    } catch (error) {
      throw new Error(`Could not find free ports in range 9000 - 9100 on 127.0.0.1. At least ${numberOfPortsNeeded} free ports are needed.`);
    }
  });

  it('listens on correct port', async () => {
    const port = getFreePort();
    const { app } = await simpleExpress({ port });
    expect(app.server.address().port).toBe(port);
  });
  it('passes routeParams to routes', async () => {
    const foo = 'works';

    const { app } = await simpleExpress({
      routes: [
        {
          path: '/',
          handlers: {
            get: [
              ({ foo }) => ({
                body: foo,
              })
            ],
          },
        },
      ],
      routeParams: { foo },
    });

    return request(app)
      .get('/')
      .expect('works')
      .expect(200);
  });

  describe('route', () => {
    Object.keys(routeStyles).forEach(routeStyle => {
      it(`returns string body and status code with routes in ${routeStyle} format`, async () => {
        const { app } = await simpleExpress({
          routes: routeStyles[routeStyle],
        });

        await request(app)
          .get('/')
          .expect(201)
          .expect('works');

        await request(app)
          .get('/foo/bar')
          .set('authentication', 'token')
          .expect(200)
          .expect('authenticated');

        return request(app)
          .get('/foo/bar')
          .expect(401)
          .expect('unauthenticated');
      });
    });

    it('returns json body', async () => {
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: () => ({
                body: { foo: 'bar', baz: 1 },
              }),
            },
          },
        ],
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect({ foo: 'bar', baz: 1 });
    });
    it('gets body, query and params', async () => {
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/:foo/:bar',
            handlers: {
              post: ({ body, query, params }) => ({
                body: { body, query, params },
              }),
            },
          },
        ],
      });

      await request(app)
        .post('/baz/bam?baq=test')
        .send({ baq: 1 })
        .expect(200)
        .expect({ body: { baq: 1 }, params: { foo: 'baz', bar: 'bam' }, query: { baq: 'test' } });
    });
    it('gets res.locals', async () => {
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                ({ next, locals }) => {
                  locals.foo = 'bar';
                  next();
                },
                ({ locals }) => ({
                  body: { foo: locals.foo },
                })
              ],
            },
          },
        ],
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect({ foo: 'bar' });
    });
    it('gets next to work as middleware', async () => {
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                ({ next, res }) => {
                  res.locals = 'works';
                  next();
                },
                ({ res }) => ({
                  body: res.locals,
                })
              ]
            },
          },
        ],
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('works');
    });
    it('does not return response when not returning object', async () => {
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                ({ res }) => {
                  res.send('works');
                  return 'i\'m not going to be sent';
                },
              ]
            },
          },
        ],
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('works');
    });
  });

  describe('validationMiddleware', () => {
    it('validates params, body, query, headers according to the provided propTypes', async () => {
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/:bam',
            handlers: {
              post: [
                checkPropTypes({
                  body: PropTypes.shape({
                    foo: PropTypes.number,
                    bar: PropTypes.number,
                  }),
                  query: {
                    baz: PropTypes.oneOf(['right']),
                  },
                  params: {
                    bam: PropTypes.oneOf(['correct']),
                  },
                  headers: {
                    custom: PropTypes.oneOf(['notwrong']).isRequired,
                  },
                }),
                () => ({
                  body: 'works'
                })
              ],
            },
          },
        ],
        errorHandlers: [
          (error, { next }) => {
            if (error instanceof ValidationError) {
              return {
                status: 400,
                body: {
                  message: 'Bad request',
                  errors: error.errors,
                },
              };
            }
            next();
          },
        ],
      });

      await request(app)
        .post('/correct')
        .set('custom', 'notwrong')
        .send({ foo: 123, bar: '123' })
        .expect(400);

      await request(app)
        .post('/correct?baz=wrong')
        .set('custom', 'notwrong')
        .send({ foo: 123, bar: 123 })
        .expect(400);

      await request(app)
        .post('/wrong?baz=right')
        .set('custom', 'notwrong')
        .send({ foo: 123, bar: 123 })
        .expect(400);

      await request(app)
        .post('/correct?baz=right')
        .set('custom', 'notright')
        .send({ foo: 123, bar: 123 })
        .expect(400);

      return request(app)
        .post('/correct?baz=right')
        .set('custom', 'notwrong')
        .send({ foo: 123, bar: 123 })
        .expect('works')
        .expect(200);
    });
  });
  describe('middlewareWrapper', () => {
    it('wraps middleware', async () => {
      const expressMiddleware = (req, res, next) => {
        res.locals = 'works';
        next();
      };

      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                wrapMiddleware(expressMiddleware),
                ({ res }) => ({
                  body: res.locals,
                })
              ],
            },
          },
        ],
      });

      return request(app)
        .get('/')
        .expect('works')
        .expect(200);
    });
    it('wraps array of middlewares', async () => {
      const expressMiddleware1 = (req, res, next) => {
        res.locals = 'wor';
        next();
      };
      const expressMiddleware2 = (req, res, next) => {
        res.locals += 'ks';
        next();
      };

      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                wrapMiddleware([
                  expressMiddleware1,
                  expressMiddleware2,
                ]),
                ({ res }) => ({
                  body: res.locals,
                })
              ],
            },
          },
        ],
      });

      return request(app)
        .get('/')
        .expect('works')
        .expect(200);
    });
  });
  describe('errorHandler', () => {
    it('gets error provided to next function by route', async () => {
      const error = new Error('test error');
      const errorHandler = jest.fn(() => ({ body: 'works' }));
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                ({ next }) => next(error),
              ]
            },
          },
        ],
        errorHandlers: [
          errorHandler,
        ]
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('works');

      expect(errorHandler.mock.calls[0][0]).toBe(error);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
    it('gets error returned by route', async () => {
      const error = new Error('test error');
      const errorHandler = jest.fn(() => ({ body: 'works' }));
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                () => error,
              ]
            },
          },
        ],
        errorHandlers: [
          errorHandler,
        ]
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('works');

      expect(errorHandler.mock.calls[0][0]).toBe(error);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
    it('gets error thrown by route', async () => {
      const error = new Error('test error');
      const errorHandler = jest.fn(() => ({ body: 'works' }));
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                () => {
                  throw error;
                },
              ]
            },
          },
        ],
        errorHandlers: [
          errorHandler,
        ]
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('works');

      expect(errorHandler.mock.calls[0][0]).toBe(error);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
    it('gets body and query', async () => {
      const error = new Error('test error');
      const errorHandler = jest.fn(
        (error, { body, query }) => ({
          body: { body, query },
        })
      );
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/:foo/:bar',
            handlers: {
              post: [
                ({ next }) => next(error),
              ]
            },
          },
        ],
        errorHandlers: [
          errorHandler,
        ]
      });

      await request(app)
        .post('/baz/bam?baq=test')
        .send({ baq: 1 })
        .expect(200)
        .expect({ body: { baq: 1 }, query: { baq: 'test' } });

      expect(errorHandler.mock.calls[0][0]).toBe(error);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
    it('gets res.locals', async () => {
      const error = new Error('test error');
      const errorHandler = jest.fn(
        (error, { locals }) => ({
          body: { foo: locals.foo },
        })
      );
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                ({ next, locals }) => {
                  locals.foo = 'bar';
                  next();
                },
                ({ next }) => next(error),
              ]
            },
          },
        ],
        errorHandlers: [
          errorHandler,
        ]
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect({ foo: 'bar' });

      expect(errorHandler.mock.calls[0][0]).toBe(error);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
  });
  describe('handleError helper', () => {
    it('chooses correct handler to handle the error', async () => {
      const Error1 = class extends Error {};
      const Error2 = class extends Error {};
      const error2 = new Error2('test error');
      const errorHandler1 = jest.fn(() => ({ body: 'works1' }));
      const errorHandler2 = jest.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                () => error2,
              ]
            },
          },
        ],
        errorHandlers: [
          handleError(Error1, errorHandler1),
          handleError(Error2, errorHandler2),
        ]
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('works2');

      expect(errorHandler2.mock.calls[0][0]).toBe(error2);
      expect(errorHandler2).toHaveBeenCalledTimes(1);
      expect(errorHandler1).toHaveBeenCalledTimes(0);
    });
  })
});
