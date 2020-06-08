import request from 'supertest';
import freePort from 'find-free-port';
import simpleExpress, { ValidationError, checkPropTypes, wrapMiddleware, handleError } from '../index';
import PropTypes from 'prop-types';

import { routeStyles } from './testData/routeTypes';

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
      describe(`in ${routeStyle} format`, () => {
        it('returns string body and status code with', async () => {
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
        it('handles get, post, put, delete method', async () => {
          const { app } = await simpleExpress({
            routes: routeStyles[routeStyle],
          });

          await request(app)
            .get('/method')
            .expect('works get');

          await request(app)
            .post('/method')
            .expect('works post');

          await request(app)
            .put('/method')
            .expect('works put');

          await request(app)
            .delete('/method')
            .expect('works delete');
        });
        it('handles use method', async () => {
          const { app } = await simpleExpress({
            routes: routeStyles[routeStyle],
          });

          await request(app)
            .get('/allmethods')
            .expect('works use');

          await request(app)
            .post('/allmethods')
            .expect('works use');

          await request(app)
            .delete('/allmethods')
            .expect('works use');

          await request(app)
            .put('/allmethods')
            .expect('works use');
        });
      });
    });

    it('returns json body', async () => {
      const { app } = await simpleExpress({
        routes: [
          ['/', {
            get: () => ({
              body: { foo: 'bar', baz: 1 },
            }),
          }],
        ],
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect({ foo: 'bar', baz: 1 });
    });
    it('returns response with Content-Type set', async () => {
      const { app } = await simpleExpress({
        routes: [
          ['/css', {
            get: () => ({
              body: '.body { background-color: red }',
              type: 'css'
            }),
          }],
          ['/html', {
            get: () => ({
              body: '<html></html>',
              type: 'html'
            }),
          }],
          ['/js', {
            get: () => ({
              body: 'alert(\'hello\')',
              type: 'text/javascript'
            }),
          }],
          ['/json', {
            get: () => ({
              body: { foo: 'bar' },
            }),
          }],

        ],
      });

      await request(app)
        .get('/css')
        .expect(200)
        .expect('Content-Type', 'text/css; charset=utf-8')
        .expect('.body { background-color: red }');

      await request(app)
        .get('/html')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect('<html></html>');

      await request(app)
        .get('/js')
        .expect(200)
        .expect('Content-Type', 'text/javascript; charset=utf-8')
        .expect('alert(\'hello\')');

      await request(app)
        .get('/json')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ foo: 'bar' });
    });
    it('returns response with headers set', async () => {
      const { app } = await simpleExpress({
        routes: [
          ['/', {
            get: () => ({
              body: { bar: 'baz' },
              headers: {
                custom: 'headerValue',
                foo: 'works'
              }
            }),
          }],

        ],
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('custom', 'headerValue')
        .expect('foo', 'works')
        .expect({ bar: 'baz' });
    });
    it('returns a redirect', async () => {
      const { app } = await simpleExpress({
        routes: [
          ['/found', {
            get: () => ({
              redirect: '/foo',
            }),
          }],
          ['/moved', {
            get: () => ({
              status: 301,
              redirect: '/foo',
            }),
          }],
          ['/foo', {
            get: () => ({
              status: 201,
              body: { foo: 'bar' }
            })
          }]
        ],
      });

      await request(app)
        .get('/found')
        .redirects(0)
        .expect(302);

      await request(app)
        .get('/found')
        .redirects(1)
        .expect(201)
        .expect({ foo: 'bar' });

      await request(app)
        .get('/moved')
        .redirects(0)
        .expect(301);

      await request(app)
        .get('/moved')
        .redirects(1)
        .expect(201)
        .expect({ foo: 'bar' });
    });
    it('gets body, query and params', async () => {
      const { app } = await simpleExpress({
        routes: [
          ['/:foo/:bar', {
            post: ({ body, query, params }) => ({
              body: { body, query, params },
            }),
          }],
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
          ['/', {
            get: [
              ({ next, locals }) => {
                locals.foo = 'bar';
                next();
              },
              ({ locals }) => ({
                body: { foo: locals.foo },
              })
            ],
          }],
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
          ['/', {
            get: [
              ({ next, res }) => {
                res.locals = 'works';
                next();
              },
              ({ res }) => ({
                body: res.locals,
              })
            ]
          }],
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
          ['/', {
            get: [
              ({ res }) => {
                res.send('works');
                return 'i\'m not going to be sent';
              },
            ]
          }],
        ],
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('works');
    });
    it('does return response as json when set json method', async () => {
      const { app } = await simpleExpress({
        routes: [
          ['/', {
            get: [
              () => ({
                method: 'json',
                body: 'works',
              }),
            ],
          }],
        ],
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('Content-type', 'application/json; charset=utf-8')
        .expect('"works"');
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
  describe('middleware', () => {
    it('returns json body', async () => {
      const { app } = await simpleExpress({
        middleware: [
          () => ({
            body: { foo: 'bar', bam: 2 },
          }),
        ],
        routes: [
          ['/', {
            get: () => ({
              body: { foo: 'baz', baz: 1 },
            }),
          }],
        ],
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect({ foo: 'bar', bam: 2 });
    });
    it('gets body, query, locals and next', async () => {
      const { app } = await simpleExpress({
        middleware: [
          ({ body, query, locals, next }) => {
            locals.result = { body, query };
            next()
          }
        ],
        routes: [
          ['/foo/bar', {
            post: ({ locals }) => ({
              body: locals.result,
            }),
          }],
        ],
      });

      await request(app)
        .post('/foo/bar?baq=test')
        .send({ baq: 1 })
        .expect(200)
        .expect({ body: { baq: 1 }, query: { baq: 'test' } });
    });
    it('can be nested', async () => {
      const middleware1 = ({ locals, next }) => {
        locals.result = 'wo';
        next();
      };
      const middleware2 = ({ locals, next }) => {
        locals.result += 'rk';
        next();
      };
      const middleware3 = ({ locals, next }) => {
        locals.result += 's';
        next();
      };

      const { app } = await simpleExpress({
        middleware: [
          middleware1,
          [
            middleware2,
            middleware3,
          ],
        ],
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                ({ res }) => ({
                  body: res.locals.result,
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
    it('wraps nested middlewares', async () => {
      const expressMiddleware1 = (req, res, next) => {
        res.locals = 'wo';
        next();
      };
      const expressMiddleware2 = (req, res, next) => {
        res.locals += 'rk';
        next();
      };
      const expressMiddleware3 = (req, res, next) => {
        res.locals += 's';
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
                  [
                    expressMiddleware2,
                    expressMiddleware3,
                  ],
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
    it('wraps middlewares provided as separate arguments', async () => {
      const expressMiddleware1 = (req, res, next) => {
        res.locals = 'wo';
        next();
      };
      const expressMiddleware2 = (req, res, next) => {
        res.locals += 'rk';
        next();
      };
      const expressMiddleware3 = (req, res, next) => {
        res.locals += 's';
        next();
      };

      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                wrapMiddleware(
                  expressMiddleware1,
                  [
                    expressMiddleware2,
                    expressMiddleware3,
                  ]
                ),
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
          ['/', {
            get: [
              () => error2,
            ]
          }],
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
    it('chooses correct handler to handle the error when provided with list of error handlers', async () => {
      const Error1 = class extends Error {};
      const Error2 = class extends Error {};
      const error2 = new Error2('test error');
      const errorHandler1 = jest.fn(() => ({ body: 'works1' }));
      const errorHandler2 = jest.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          ['/', {
            get: [
              () => error2,
            ]
          }],
        ],
        errorHandlers: [
          handleError([
            [Error1, errorHandler1],
            [Error2, errorHandler2],
          ]),
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
    it('chooses correct handler to handle the error when provided with more errors per handler', async () => {
      const Error1 = class extends Error {};
      const Error2a = class extends Error {};
      const Error2b = class extends Error {};
      const error2a = new Error2a('test error');
      const error2b = new Error2b('test error');
      const errorHandler1 = jest.fn(() => ({ body: 'works1' }));
      const errorHandler2 = jest.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          ['/', {
            get: [
              () => error2a,
            ]
          }],
          ['/b', {
            get: [
              () => error2b,
            ]
          }],
        ],
        errorHandlers: [
          handleError(Error1, errorHandler1),
          handleError([Error2a, Error2b], errorHandler2),
        ]
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('works2');

      await request(app)
        .get('/b')
        .expect(200)
        .expect('works2');

      expect(errorHandler2.mock.calls[0][0]).toBe(error2a);
      expect(errorHandler2.mock.calls[1][0]).toBe(error2b);
      expect(errorHandler2).toHaveBeenCalledTimes(2);
      expect(errorHandler1).toHaveBeenCalledTimes(0);
    });
    it('chooses correct handler to handle the error when provided with list with more errors per handler', async () => {
      const Error1 = class extends Error {};
      const Error2a = class extends Error {};
      const Error2b = class extends Error {};
      const error2a = new Error2a('test error');
      const error2b = new Error2b('test error');
      const errorHandler1 = jest.fn(() => ({ body: 'works1' }));
      const errorHandler2 = jest.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          ['/', {
            get: [
              () => error2a,
            ]
          }],
          ['/b', {
            get: [
              () => error2b,
            ]
          }],
        ],
        errorHandlers: [
          handleError([
            [Error1, errorHandler1],
            [[Error2a, Error2b], errorHandler2],
          ]),
        ]
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('works2');

      await request(app)
        .get('/b')
        .expect(200)
        .expect('works2');

      expect(errorHandler2.mock.calls[0][0]).toBe(error2a);
      expect(errorHandler2.mock.calls[1][0]).toBe(error2b);
      expect(errorHandler2).toHaveBeenCalledTimes(2);
      expect(errorHandler1).toHaveBeenCalledTimes(0);
    });
    it('chooses correct handler to handle the unknown error', async () => {
      const Error1 = class extends Error {};
      const Error2 = class extends Error {};
      const error2 = new Error2('test error');
      const errorHandler1 = jest.fn(() => ({ body: 'works1' }));
      const errorHandler2 = jest.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          ['/', {
            get: [
              () => error2,
            ]
          }],
        ],
        errorHandlers: [
          handleError(Error1, errorHandler1),
          handleError(errorHandler2),
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
    it('chooses correct handler to handle the unknown error when provided with list of handlers', async () => {
      const Error1 = class extends Error {};
      const Error2 = class extends Error {};
      const error2 = new Error2('test error');
      const errorHandler1 = jest.fn(() => ({ body: 'works1' }));
      const errorHandler2 = jest.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          ['/', {
            get: [
              () => error2,
            ]
          }],
        ],
        errorHandlers: [
          handleError([
            [Error1, errorHandler1],
            errorHandler2,
          ]),
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
    it('chooses correct handler to handle the unknown error when provided with nested list of handlers', async () => {
      const Error1 = class extends Error {};
      const Error2 = class extends Error {};
      const error2 = new Error2('test error');
      const errorHandler1 = jest.fn(() => ({ body: 'works1' }));
      const errorHandler2 = jest.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          ['/', {
            get: [
              () => error2,
            ]
          }],
        ],
        errorHandlers: [
          handleError([
            [Error1, errorHandler1],
            [errorHandler2],
          ]),
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
  });

  describe('plugins', () => {
    describe('getHandlerParams', () => {
      it('add additional route params', async () => {
        const getHandlerParams = jest.fn(routeParams => ({
          ...routeParams,
          additionalParam: 'works',
        }));
        const plugin = jest.fn(() => ({ getHandlerParams }));

        const routes = [
          ['/', {
            get: [
              ({ additionalParam }) => ({ body: additionalParam }),
            ]
          }],
        ];

        const { app } = await simpleExpress({ routes, plugins: [ plugin ] });

        await request(app)
          .get('/')
          .expect(200)
          .expect('works');

        expect(plugin.mock.calls[0][0].routes).toEqual(routes);
        expect(plugin).toHaveBeenCalledTimes(1);
      });
      it('are triggered in the right order', async () => {
        const getHandlerParams1 = jest.fn(routeParams => ({
          ...routeParams,
          additionalParam: 'works1',
        }));
        const getHandlerParams2 = jest.fn(routeParams => ({
          ...routeParams,
          additionalParam: 'works2',
        }));
        const plugin1 = jest.fn(() => ({ getHandlerParams: getHandlerParams1 }));
        const plugin2 = jest.fn(() => ({ getHandlerParams: getHandlerParams2 }));

        const routes = [
          ['/', {
            get: [
              ({ additionalParam }) => ({ body: additionalParam }),
            ]
          }],
        ];

        const { app } = await simpleExpress({
          routes,
          plugins: [
            plugin1,
            plugin2,
          ],
        });

        await request(app)
          .get('/')
          .expect(200)
          .expect('works2');

        expect(plugin1.mock.calls[0][0].routes).toBe(routes);
        expect(plugin2.mock.calls[0][0].routes).toBe(routes);
        expect(plugin1).toHaveBeenCalledTimes(1);
        expect(plugin2).toHaveBeenCalledTimes(1);
        expect(plugin1).toHaveBeenCalledBefore(plugin2);
      });
    });
    describe('getErrorHandlerParams', () => {
      it('add additional error handler params', async () => {
        const getErrorHandlerParams = jest.fn(routeParams => ({
          ...routeParams,
          additionalParam: 'works',
        }));
        const plugin = jest.fn(() => ({ getErrorHandlerParams }));

        const routes = [
          ['/', {
            get: [
              () => new Error('Ups!'),
            ]
          }],
        ];

        const errorHandlers = [
          (error, { additionalParam }) => ({ body: additionalParam })
        ];

        const { app } = await simpleExpress({ routes, errorHandlers, plugins: [ plugin ] });

        await request(app)
          .get('/')
          .expect(200)
          .expect('works');

        expect(plugin.mock.calls[0][0].routes).toEqual(routes);
        expect(plugin.mock.calls[0][0].errorHandlers).toEqual(errorHandlers);
        expect(plugin).toHaveBeenCalledTimes(1);
      });
      it('are triggered in the right order', async () => {
        const getErrorHandlerParams1 = jest.fn(routeParams => ({
          ...routeParams,
          additionalParam: 'works1',
        }));
        const getErrorHandlerParams2 = jest.fn(routeParams => ({
          ...routeParams,
          additionalParam: 'works2',
        }));
        const plugin1 = jest.fn(() => ({ getErrorHandlerParams: getErrorHandlerParams1 }));
        const plugin2 = jest.fn(() => ({ getErrorHandlerParams: getErrorHandlerParams2 }));

        const routes = [
          ['/', {
            get: [
              () => new Error('Ups!'),
            ]
          }],
        ];

        const errorHandlers = [
          (error, { additionalParam }) => ({ body: additionalParam })
        ];

        const { app } = await simpleExpress({
          routes,
          errorHandlers,
          plugins: [
            plugin1,
            plugin2,
          ],
        });

        await request(app)
          .get('/')
          .expect(200)
          .expect('works2');

        expect(plugin1.mock.calls[0][0].routes).toBe(routes);
        expect(plugin1.mock.calls[0][0].errorHandlers).toBe(errorHandlers);
        expect(plugin2.mock.calls[0][0].routes).toBe(routes);
        expect(plugin2.mock.calls[0][0].errorHandlers).toBe(errorHandlers);
        expect(plugin1).toHaveBeenCalledTimes(1);
        expect(plugin2).toHaveBeenCalledTimes(1);
        expect(plugin1).toHaveBeenCalledBefore(plugin2);
      });
    });
    describe('mapResponse', () => {
      it('maps response', async () => {
        const mapResponse = jest.fn(response => ({
          ...response,
          body: response.alternativeBody,
        }));
        const plugin = jest.fn(() => ({ mapResponse }));

        const routes = [
          ['/', {
            get: [
              () => ({ alternativeBody: 'works' }),
            ]
          }],
        ];

        const { app } = await simpleExpress({ routes, plugins: [ plugin ] });

        await request(app)
          .get('/')
          .expect(200)
          .expect('works');

        expect(plugin.mock.calls[0][0].routes).toEqual(routes);
        expect(plugin).toHaveBeenCalledTimes(1);
      });
      it('disables response and sends it manually', async () => {
        const mapResponse = jest.fn((response, { res }) => {
          res.send(response.alternativeBody);
          return null;
        });
        const plugin = jest.fn(() => ({ mapResponse }));

        const routes = [
          ['/', {
            get: [
              () => ({ alternativeBody: 'works' }),
            ]
          }],
        ];

        const { app } = await simpleExpress({ routes, plugins: [ plugin ] });

        await request(app)
          .get('/')
          .expect(200)
          .expect('works');

        expect(plugin.mock.calls[0][0].routes).toEqual(routes);
        expect(plugin).toHaveBeenCalledTimes(1);
      });
      it('stops executing plugins after manual response', async () => {
        const mapResponse1 = jest.fn((response, { res }) => {
          res.send(response.alternativeBody);
          return null;
        });
        const plugin1 = jest.fn(() => ({ mapResponse: mapResponse1 }));

        const mapResponse2 = jest.fn((response, { res }) => {
          res.send('I should not be sent');
          return null;
        });
        const plugin2 = jest.fn(() => ({ mapResponse: mapResponse2 }));

        const routes = [
          ['/', {
            get: [
              () => ({ alternativeBody: 'works' }),
            ]
          }],
        ];

        const { app } = await simpleExpress({ routes, plugins: [ plugin1, plugin2 ] });

        await request(app)
          .get('/')
          .expect(200)
          .expect('works');

        expect(plugin1.mock.calls[0][0].routes).toEqual(routes);
        expect(plugin1).toHaveBeenCalledTimes(1);

        expect(mapResponse2).not.toHaveBeenCalled();
      });
    });

  });
});
