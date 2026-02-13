import freePort from 'find-free-port';
import * as matchers from 'jest-extended';
import request from 'supertest';

import simpleExpress, {
  getGlobalContext,
  getRequestContext,
  handleError,
  wrapMiddleware,
} from '../index';
import { ErrorHandler, ResponseDefinition, Routes } from '../types';
import { routeStyles } from './testData/routeTypes';

expect.extend(matchers);

describe('simpleExpress', () => {
  let freePorts = [];
  const getFreePort = () => freePorts.shift();
  beforeAll(async () => {
    const numberOfPortsNeeded = 20;

    try {
      const ports = await freePort(
        9000,
        9100,
        '127.0.0.1',
        numberOfPortsNeeded
      );
      freePorts = ports;
    } catch (error) {
      throw new Error(
        `Could not find free ports in range 9000 - 9100 on 127.0.0.1. At least ${numberOfPortsNeeded} free ports are needed.`
      );
    }
  });

  it('listens on correct port', async () => {
    const port = getFreePort();
    const {
      app,
      server,
      port: serverPort,
      address,
    } = await simpleExpress({ port });

    expect(app).toBeDefined();
    expect(server).toBeDefined();
    expect(typeof address === 'string' ? undefined : address.port).toBe(port);
    expect(serverPort).toBe(port);
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
              }),
            ],
          },
        },
      ],
      routeParams: { foo },
    });

    return request(app).get('/').expect('works').expect(200);
  });

  describe('route', () => {
    Object.keys(routeStyles).forEach((routeStyle) => {
      describe(`in ${routeStyle} format`, () => {
        it('returns string body and status code with', async () => {
          const { app } = await simpleExpress({
            routes: routeStyles[routeStyle],
            errorHandlers: [
              (error) => {
                console.log('WTF?', routeStyle, error);
                return {
                  status: 500,
                };
              },
            ],
          });

          await request(app).get('/').expect(201).expect('works');

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

          await request(app).get('/method').expect('works get');

          await request(app).post('/method').expect('works post');

          await request(app).put('/method').expect('works put');

          await request(app).delete('/method').expect('works delete');
        });
        it('handles use method', async () => {
          const { app } = await simpleExpress({
            routes: routeStyles[routeStyle],
          });

          await request(app).get('/allmethods').expect('works use');

          await request(app).post('/allmethods').expect('works use');

          await request(app).delete('/allmethods').expect('works use');

          await request(app).put('/allmethods').expect('works use');
        });
      });
    });

    it('returns json body', async () => {
      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: () => ({
                body: { foo: 'bar', baz: 1 },
              }),
            },
          ],
        ],
      });

      await request(app).get('/').expect(200).expect({ foo: 'bar', baz: 1 });
    });
    it('returns response with Content-Type set', async () => {
      const { app } = await simpleExpress({
        routes: [
          [
            '/css',
            {
              get: () => ({
                body: '.body { background-color: red }',
                type: 'css',
              }),
            },
          ],
          [
            '/html',
            {
              get: () => ({
                body: '<html></html>',
                type: 'html',
              }),
            },
          ],
          [
            '/js',
            {
              get: () => ({
                body: "alert('hello')",
                type: 'text/javascript',
              }),
            },
          ],
          [
            '/json',
            {
              get: () => ({
                body: { foo: 'bar' },
              }),
            },
          ],
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
        .expect("alert('hello')");

      await request(app)
        .get('/json')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({ foo: 'bar' });
    });
    it('returns response with headers set', async () => {
      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: () => ({
                body: { bar: 'baz' },
                headers: {
                  custom: 'headerValue',
                  foo: 'works',
                },
              }),
            },
          ],
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
          [
            '/found',
            {
              get: () => ({
                redirect: '/foo',
              }),
            },
          ],
          [
            '/moved',
            {
              get: () => ({
                status: 301,
                redirect: '/foo',
              }),
            },
          ],
          [
            '/foo',
            {
              get: () => ({
                status: 201,
                body: { foo: 'bar' },
              }),
            },
          ],
        ],
      });

      await request(app).get('/found').redirects(0).expect(302);

      await request(app)
        .get('/found')
        .redirects(1)
        .expect(201)
        .expect({ foo: 'bar' });

      await request(app).get('/moved').redirects(0).expect(301);

      await request(app)
        .get('/moved')
        .redirects(1)
        .expect(201)
        .expect({ foo: 'bar' });
    });
    it('gets body, query and params', async () => {
      const { app } = await simpleExpress({
        routes: [
          [
            '/:foo/:bar',
            {
              post: ({ body, query, params }) => ({
                body: { body, query, params },
              }),
            },
          ],
        ],
      });

      await request(app)
        .post('/baz/bam?baq=test')
        .send({ baq: 1 })
        .expect(200)
        .expect({
          body: { baq: 1 },
          params: { foo: 'baz', bar: 'bam' },
          query: { baq: 'test' },
        });
    });
    it('gets res.locals', async () => {
      const { app } = await simpleExpress<{}, { foo: string }>({
        routes: [
          [
            '/',
            {
              get: [
                ({ next, locals }) => {
                  locals.foo = 'bar';
                  next();
                },
                ({ locals }) => ({
                  body: { foo: locals.foo },
                }),
              ],
            },
          ],
        ],
      });

      await request(app).get('/').expect(200).expect({ foo: 'bar' });
    });
    it('gets next to work as middleware', async () => {
      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: [
                ({ next, res }) => {
                  res.locals.value = 'works';
                  next();
                },
                ({ res }) => ({
                  body: res.locals.value,
                }),
              ],
            },
          ],
        ],
      });

      await request(app).get('/').expect(200).expect('works');
    });
    it('does not return response when not returning object', async () => {
      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: [
                ({ res }) => {
                  res.send('works');
                  return "i'm not going to be sent" as any;
                },
              ],
            },
          ],
        ],
      });

      await request(app).get('/').expect(200).expect('works');
    });
    it('does return response as json when set json method', async () => {
      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: [
                () => ({
                  method: 'json',
                  body: 'works',
                }),
              ],
            },
          ],
        ],
      });

      await request(app)
        .get('/')
        .expect(200)
        .expect('Content-type', 'application/json; charset=utf-8')
        .expect('"works"');
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
          [
            '/',
            {
              get: () => ({
                body: { foo: 'baz', baz: 1 },
              }),
            },
          ],
        ],
      });

      await request(app).get('/').expect(200).expect({ foo: 'bar', bam: 2 });
    });
    it('gets body, query, locals and next', async () => {
      const { app } = await simpleExpress({
        middleware: [
          ({ body, query, locals, next }) => {
            locals.result = { body, query };
            next();
          },
        ],
        routes: [
          [
            '/foo/bar',
            {
              post: ({ locals }: { locals: { result: any } }) => ({
                body: locals.result,
              }),
            },
          ],
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
        middleware: [middleware1, [middleware2, middleware3]],
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                ({ res }) => ({
                  body: res.locals.result,
                }),
              ],
            },
          },
        ],
      });

      return request(app).get('/').expect('works').expect(200);
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
                }),
              ],
            },
          },
        ],
      });

      return request(app).get('/').expect('works').expect(200);
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
                wrapMiddleware([expressMiddleware1, expressMiddleware2]),
                ({ res }) => ({
                  body: res.locals,
                }),
              ],
            },
          },
        ],
      });

      return request(app).get('/').expect('works').expect(200);
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
                  [expressMiddleware2, expressMiddleware3] as any, // typescript has one level of nesting, for my sanity
                ]),
                ({ res }) => ({
                  body: res.locals,
                }),
              ],
            },
          },
        ],
      });

      return request(app).get('/').expect('works').expect(200);
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
                wrapMiddleware(expressMiddleware1, [
                  expressMiddleware2,
                  expressMiddleware3,
                ]),
                ({ res }) => ({
                  body: res.locals,
                }),
              ],
            },
          },
        ],
      });

      return request(app).get('/').expect('works').expect(200);
    });
  });
  describe('errorHandler', () => {
    it('gets error provided to next function by route', async () => {
      const error = new Error('test error');
      const errorHandler = vi.fn(() => ({ body: 'works' }));
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [({ next }) => next(error)],
            },
          },
        ],
        errorHandlers: [errorHandler],
      });

      await request(app).get('/').expect(200).expect('works');

      // @ts-ignore
      expect(errorHandler.mock.calls[0][0]).toBe(error);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
    it('gets error returned by route', async () => {
      const error = new Error('test error');
      const errorHandler = vi.fn(() => ({ body: 'works' }));
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [() => error],
            },
          },
        ],
        errorHandlers: [errorHandler],
      });

      await request(app).get('/').expect(200).expect('works');

      // @ts-ignore
      expect(errorHandler.mock.calls[0][0]).toBe(error);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
    it('gets error thrown by route', async () => {
      const error = new Error('test error');
      const errorHandler = vi.fn(() => ({ body: 'works' }));
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/',
            handlers: {
              get: [
                () => {
                  throw error;
                },
              ],
            },
          },
        ],
        errorHandlers: [errorHandler],
      });

      await request(app).get('/').expect(200).expect('works');

      // @ts-ignore
      expect(errorHandler.mock.calls[0][0]).toBe(error);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
    it('gets body and query', async () => {
      const error = new Error('test error');
      const errorHandler = vi.fn((error, { body, query }) => ({
        body: { body, query },
      }));
      const { app } = await simpleExpress({
        routes: [
          {
            path: '/:foo/:bar',
            handlers: {
              post: [({ next }) => next(error)],
            },
          },
        ],
        errorHandlers: [errorHandler],
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
      const errorHandler = vi.fn((error, { locals }) => ({
        body: { foo: locals.foo },
      }));
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
              ],
            },
          },
        ],
        errorHandlers: [errorHandler],
      });

      await request(app).get('/').expect(200).expect({ foo: 'bar' });

      expect(errorHandler.mock.calls[0][0]).toBe(error);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
  });
  describe('handleError helper', () => {
    it('chooses correct handler to handle the error', async () => {
      const Error1 = class extends Error {};
      const Error2 = class extends Error {};
      const error2 = new Error2('test error');
      const errorHandler1 = vi.fn(() => ({ body: 'works1' }));
      const errorHandler2 = vi.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: [() => error2],
            },
          ],
        ],
        errorHandlers: [
          handleError(Error1, errorHandler1),
          handleError(Error2, errorHandler2),
        ],
      });

      await request(app).get('/').expect(200).expect('works2');

      expect(errorHandler2.mock.calls[0][0 as any]).toBe(error2);
      expect(errorHandler2).toHaveBeenCalledTimes(1);
      expect(errorHandler1).toHaveBeenCalledTimes(0);
    });
    it('chooses correct handler to handle the error when provided with list of error handlers', async () => {
      const Error1 = class extends Error {};
      const Error2 = class extends Error {};
      const error2 = new Error2('test error');
      const errorHandler1 = vi.fn(() => ({ body: 'works1' }));
      const errorHandler2 = vi.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: [() => error2],
            },
          ],
        ],
        errorHandlers: [
          handleError([
            [Error1, errorHandler1],
            [Error2, errorHandler2],
          ]),
        ],
      });

      await request(app).get('/').expect(200).expect('works2');

      expect(errorHandler2.mock.calls[0][0 as any]).toBe(error2);
      expect(errorHandler2).toHaveBeenCalledTimes(1);
      expect(errorHandler1).toHaveBeenCalledTimes(0);
    });
    it('chooses correct handler to handle the error when provided with more errors per handler', async () => {
      const Error1 = class extends Error {};
      const Error2a = class extends Error {};
      const Error2b = class extends Error {};
      const error2a = new Error2a('test error');
      const error2b = new Error2b('test error');
      const errorHandler1 = vi.fn(() => ({ body: 'works1' }));
      const errorHandler2 = vi.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: [() => error2a],
            },
          ],
          [
            '/b',
            {
              get: [() => error2b],
            },
          ],
        ],
        errorHandlers: [
          handleError(Error1, errorHandler1),
          handleError([Error2a, Error2b], errorHandler2),
        ],
      });

      await request(app).get('/').expect(200).expect('works2');

      await request(app).get('/b').expect(200).expect('works2');

      expect(errorHandler2.mock.calls[0][0 as any]).toBe(error2a);
      expect(errorHandler2.mock.calls[1][0 as any]).toBe(error2b);
      expect(errorHandler2).toHaveBeenCalledTimes(2);
      expect(errorHandler1).toHaveBeenCalledTimes(0);
    });
    it('chooses correct handler to handle the error when provided with list with more errors per handler', async () => {
      const Error1 = class extends Error {};
      const Error2a = class extends Error {};
      const Error2b = class extends Error {};
      const error2a = new Error2a('test error');
      const error2b = new Error2b('test error');
      const errorHandler1 = vi.fn(() => ({ body: 'works1' }));
      const errorHandler2 = vi.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: [() => error2a],
            },
          ],
          [
            '/b',
            {
              get: [() => error2b],
            },
          ],
        ],
        errorHandlers: [
          handleError([
            [Error1, errorHandler1],
            [[Error2a, Error2b], errorHandler2],
          ]),
        ],
      });

      await request(app).get('/').expect(200).expect('works2');

      await request(app).get('/b').expect(200).expect('works2');

      expect(errorHandler2.mock.calls[0][0 as any]).toBe(error2a);
      expect(errorHandler2.mock.calls[1][0 as any]).toBe(error2b);
      expect(errorHandler2).toHaveBeenCalledTimes(2);
      expect(errorHandler1).toHaveBeenCalledTimes(0);
    });
    it('chooses correct handler to handle the unknown error', async () => {
      const Error1 = class extends Error {};
      const Error2 = class extends Error {};
      const error2 = new Error2('test error');
      const errorHandler1 = vi.fn(() => ({ body: 'works1' }));
      const errorHandler2 = vi.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: [() => error2],
            },
          ],
        ],
        errorHandlers: [
          handleError(Error1, errorHandler1),
          handleError(errorHandler2),
        ],
      });

      await request(app).get('/').expect(200).expect('works2');

      expect(errorHandler2.mock.calls[0][0 as any]).toBe(error2);
      expect(errorHandler2).toHaveBeenCalledTimes(1);
      expect(errorHandler1).toHaveBeenCalledTimes(0);
    });
    it('chooses correct handler to handle the unknown error when provided with list of handlers', async () => {
      const Error1 = class extends Error {};
      const Error2 = class extends Error {};
      const error2 = new Error2('test error');
      const errorHandler1 = vi.fn(() => ({ body: 'works1' }));
      const errorHandler2 = vi.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: [() => error2],
            },
          ],
        ],
        errorHandlers: [handleError([[Error1, errorHandler1], errorHandler2])],
      });

      await request(app).get('/').expect(200).expect('works2');

      expect(errorHandler2.mock.calls[0][0 as any]).toBe(error2);
      expect(errorHandler2).toHaveBeenCalledTimes(1);
      expect(errorHandler1).toHaveBeenCalledTimes(0);
    });
    it('chooses correct handler to handle the unknown error when provided with nested list of handlers', async () => {
      const Error1 = class extends Error {};
      const Error2 = class extends Error {};
      const error2 = new Error2('test error');
      const errorHandler1 = vi.fn(() => ({ body: 'works1' }));
      const errorHandler2 = vi.fn(() => ({ body: 'works2' }));

      const { app } = await simpleExpress({
        routes: [
          [
            '/',
            {
              get: [() => error2],
            },
          ],
        ],
        errorHandlers: [
          handleError([[Error1, errorHandler1], [errorHandler2]]),
        ],
      });

      await request(app).get('/').expect(200).expect('works2');

      expect(errorHandler2.mock.calls[0][0 as any]).toBe(error2);
      expect(errorHandler2).toHaveBeenCalledTimes(1);
      expect(errorHandler1).toHaveBeenCalledTimes(0);
    });
  });

  describe('plugins', () => {
    describe('getHandlerParams', () => {
      it('add additional route params', async () => {
        const getHandlerParams = vi.fn((routeParams) => ({
          ...routeParams,
          additionalParam: 'works',
        }));
        const plugin = vi.fn(() => ({ getHandlerParams }));

        const routes: Routes<{ additionalParam: string }> = [
          [
            '/',
            {
              get: [({ additionalParam }) => ({ body: additionalParam })],
            },
          ],
        ];

        const { app } = await simpleExpress({ routes, plugins: [plugin] });

        await request(app).get('/').expect(200).expect('works');

        // @ts-ignore
        expect(plugin.mock.calls[0][0].routes).toEqual(routes);
        expect(plugin).toHaveBeenCalledTimes(1);
      });
      it('are triggered in the right order', async () => {
        const getHandlerParams1 = vi.fn((routeParams) => ({
          ...routeParams,
          additionalParam: 'works1',
        }));
        const getHandlerParams2 = vi.fn((routeParams) => ({
          ...routeParams,
          additionalParam: 'works2',
        }));
        const plugin1 = vi.fn(() => ({ getHandlerParams: getHandlerParams1 }));
        const plugin2 = vi.fn(() => ({ getHandlerParams: getHandlerParams2 }));

        const routes: Routes<{ additionalParam: string }> = [
          [
            '/',
            {
              get: [({ additionalParam }) => ({ body: additionalParam })],
            },
          ],
        ];

        const { app } = await simpleExpress({
          routes,
          plugins: [plugin1, plugin2],
        });

        await request(app).get('/').expect(200).expect('works2');

        expect((plugin1.mock.calls[0][0 as any] as any).routes).toBe(routes);
        expect((plugin2.mock.calls[0][0 as any] as any).routes).toBe(routes);
        expect(plugin1).toHaveBeenCalledTimes(1);
        expect(plugin2).toHaveBeenCalledTimes(1);
        expect(plugin1).toHaveBeenCalledBefore(plugin2);
      });
    });
    describe('getErrorHandlerParams', () => {
      it('add additional error handler params', async () => {
        const getErrorHandlerParams = vi.fn((routeParams) => ({
          ...routeParams,
          additionalParam: 'works',
        }));
        const plugin = vi.fn(() => ({ getErrorHandlerParams }));

        const routes: Routes<{ additionalParam: string }> = [
          [
            '/',
            {
              get: [() => new Error('Ups!')],
            },
          ],
        ];

        const errorHandlers: ErrorHandler<{ additionalParam: string }>[] = [
          (error, { additionalParam }) => ({ body: additionalParam }),
        ];

        const { app } = await simpleExpress({
          routes,
          errorHandlers,
          plugins: [plugin],
        });

        await request(app).get('/').expect(200).expect('works');

        expect((plugin.mock.calls[0][0 as any] as any).routes).toEqual(routes);
        expect((plugin.mock.calls[0][0 as any] as any).errorHandlers).toEqual(
          errorHandlers
        );
        expect(plugin).toHaveBeenCalledTimes(1);
      });
      it('are triggered in the right order', async () => {
        const getErrorHandlerParams1 = vi.fn((routeParams) => ({
          ...routeParams,
          additionalParam: 'works1',
        }));
        const getErrorHandlerParams2 = vi.fn((routeParams) => ({
          ...routeParams,
          additionalParam: 'works2',
        }));
        const plugin1 = vi.fn(() => ({
          getErrorHandlerParams: getErrorHandlerParams1,
        }));
        const plugin2 = vi.fn(() => ({
          getErrorHandlerParams: getErrorHandlerParams2,
        }));

        const routes: Routes<{ additionalParam: string }> = [
          [
            '/',
            {
              get: [() => new Error('Ups!')],
            },
          ],
        ];

        const errorHandlers: ErrorHandler<{ additionalParam: string }> = [
          (error, { additionalParam }) => ({ body: additionalParam }),
        ];

        const { app } = await simpleExpress({
          routes,
          errorHandlers,
          plugins: [plugin1, plugin2],
        });

        await request(app).get('/').expect(200).expect('works2');

        expect((plugin1.mock.calls[0][0 as any] as any).routes).toBe(routes);
        expect((plugin1.mock.calls[0][0 as any] as any).errorHandlers).toBe(
          errorHandlers
        );
        expect((plugin2.mock.calls[0][0 as any] as any).routes).toBe(routes);
        expect((plugin2.mock.calls[0][0 as any] as any).errorHandlers).toBe(
          errorHandlers
        );
        expect(plugin1).toHaveBeenCalledTimes(1);
        expect(plugin2).toHaveBeenCalledTimes(1);
        expect(plugin1).toHaveBeenCalledBefore(plugin2);
      });
    });
    describe('mapResponse', () => {
      it('maps response', async () => {
        const mapResponse = vi.fn((response) => ({
          ...response,
          body: response.alternativeBody,
        }));
        const plugin = vi.fn(() => ({ mapResponse }));

        const routes: Routes = [
          [
            '/',
            {
              get: [() => ({ alternativeBody: 'works' }) as ResponseDefinition],
            },
          ],
        ];

        const { app } = await simpleExpress({ routes, plugins: [plugin] });

        await request(app).get('/').expect(200).expect('works');

        expect((plugin.mock.calls[0][0 as any] as any).routes).toEqual(routes);
        expect(plugin).toHaveBeenCalledTimes(1);
      });
      it('disables response and sends it manually', async () => {
        const mapResponse = vi.fn((response, { res }) => {
          res.send(response.alternativeBody);
          return null;
        });
        const plugin = vi.fn(() => ({ mapResponse }));

        const routes: Routes = [
          [
            '/',
            {
              get: [() => ({ alternativeBody: 'works' }) as ResponseDefinition],
            },
          ],
        ];

        const { app } = await simpleExpress({ routes, plugins: [plugin] });

        await request(app).get('/').expect(200).expect('works');

        expect((plugin.mock.calls[0][0 as any] as any).routes).toEqual(routes);
        expect(plugin).toHaveBeenCalledTimes(1);
      });
      it('stops executing plugins after manual response', async () => {
        const mapResponse1 = vi.fn((response, { res }) => {
          res.send(response.alternativeBody);
          return null;
        });
        const plugin1 = vi.fn(() => ({ mapResponse: mapResponse1 }));

        const mapResponse2 = vi.fn((response, { res }) => {
          res.send('I should not be sent');
          return null;
        });
        const plugin2 = vi.fn(() => ({ mapResponse: mapResponse2 }));

        const routes: Routes = [
          [
            '/',
            {
              get: [() => ({ alternativeBody: 'works' }) as ResponseDefinition],
            },
          ],
        ];

        const { app } = await simpleExpress({
          routes,
          plugins: [plugin1, plugin2],
        });

        await request(app).get('/').expect(200).expect('works');

        expect((plugin1.mock.calls[0][0 as any] as any).routes).toEqual(routes);
        expect(plugin1).toHaveBeenCalledTimes(1);

        expect(mapResponse2).not.toHaveBeenCalled();
      });
    });
  });
  describe('requestContext', () => {
    it('adds request context to route params', async () => {
      const { app } = await simpleExpress({
        requestContext: ({ req }) => ({
          method: req.method,
          originalUrl: req.originalUrl,
        }),
        routes: [
          [
            '/foo',
            {
              get: [
                ({ requestContext }) => ({
                  body: {
                    request: `${requestContext.get('method')} ${requestContext.get('originalUrl')}`,
                  },
                }),
              ],
            },
          ],
        ],
      });

      await request(app)
        .get('/foo')
        .expect(200)
        .expect({ request: 'GET /foo' });
    });
    it('adds request context to error handler params', async () => {
      const { app } = await simpleExpress({
        requestContext: ({ req }) => ({
          method: req.method,
          originalUrl: req.originalUrl,
        }),
        routes: [
          [
            '/foo',
            {
              post: [() => new Error('Ups!')],
            },
          ],
        ],
        errorHandlers: [
          (error, { requestContext }) => ({
            body: {
              request: `${requestContext.get('method')} ${requestContext.get('originalUrl')}`,
              error: error.message,
            },
            status: 500,
          }),
        ],
      });

      await request(app)
        .post('/foo')
        .expect(500)
        .expect({ request: 'POST /foo', error: 'Ups!' });
    });
    it('creates asyncContext that can be retrieved using getRequestContext', async () => {
      const handler = async () => {
        const context = getRequestContext();
        const method = context.get('method');
        const originalUrl = context.get('originalUrl');
        return { method, originalUrl };
      };

      const { app } = await simpleExpress({
        requestContext: ({ req }) => ({
          method: req.method,
          originalUrl: req.originalUrl,
        }),
        routes: [
          [
            '/foo',
            {
              get: [
                async () => {
                  const { method, originalUrl } = await handler();
                  return { body: { request: `${method} ${originalUrl}` } };
                },
              ],
            },
          ],
        ],
      });

      await request(app)
        .get('/foo')
        .expect(200)
        .expect({ request: 'GET /foo' });
    });
  });
  describe('globalContext', () => {
    it('adds global context to route params', async () => {
      const { app } = await simpleExpress({
        globalContext: {
          foo: 'bar',
        },
        routes: [
          [
            '/',
            {
              get: [
                ({ globalContext }) => ({
                  body: { foo: globalContext.get('foo') },
                }),
              ],
            },
          ],
        ],
      });

      await request(app).get('/').expect(200).expect({ foo: 'bar' });
    });
    it('adds global context to error handler params', async () => {
      const { app } = await simpleExpress({
        globalContext: {
          foo: 'bar',
        },
        routes: [
          [
            '/',
            {
              get: [() => new Error('Ups!')],
            },
          ],
        ],
        errorHandlers: [
          (error, { globalContext }) => ({
            body: { foo: globalContext.get('foo') },
            status: 500,
          }),
        ],
      });

      await request(app).get('/').expect(500).expect({ foo: 'bar' });
    });
    it('creates asyncContext that can be retrieved using getGlobalContext', async () => {
      const handler1 = async () => {
        const context = getGlobalContext();
        const foo = context.get('foo');
        context.set('foo', 'baz');
        return { foo };
      };
      const handler2 = async () => {
        const context = getGlobalContext();
        return { foo: context.get('foo') };
      };

      const { app } = await simpleExpress({
        globalContext: {
          foo: 'bar',
        },
        routes: [
          [
            '/foo1',
            {
              get: [
                async () => {
                  const { foo } = await handler1();
                  return { body: { foo } };
                },
              ],
            },
          ],
          [
            '/foo2',
            {
              get: [
                async () => {
                  const { foo } = await handler2();
                  return { body: { foo } };
                },
              ],
            },
          ],
        ],
      });

      await request(app).get('/foo1').expect(200).expect({ foo: 'bar' });
      await request(app).get('/foo2').expect(200).expect({ foo: 'baz' });
    });
  });
});
