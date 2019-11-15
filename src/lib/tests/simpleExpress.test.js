import request from 'supertest';
import freePort from 'find-free-port';
import simpleExpress, { ValidationError, checkPropTypes } from '../index';
import PropTypes from 'prop-types';

describe('simpleExpress', () => {
  let freePorts = [];
  beforeAll(async () => {
    const numberOfPortsNeeded = 10;

    try {
      const ports = await freePort(9000, 9100, '127.0.0.1', numberOfPortsNeeded);
      freePorts = ports;
    } catch (error) {
      throw new Error(`Could not find free ports in range 9000 - 9100 on 127.0.0.1. At least ${numberOfPortsNeeded} free ports are needed.`);
    }
  });

  it('listens on correct port', async () => {
    const port = freePorts[0];
    const { app } = await simpleExpress({ port });
    expect(app.server.address().port).toBe(port);
  });
  describe('route', () => {
    it('returns string body and status code', async () => {
      const { app } = await simpleExpress({
        port: freePorts[1],
        routes: [
          {
            path: '/',
            handlers: {
              get: () => ({
                body: 'works',
                status: 201,
              }),
            },
          },
          {
            path: '/foo',
            handlers: {
              get: [
                ({ getHeader, next }) => {
                  if (getHeader('authentication') !== 'token') {
                    return {
                      status: 401,
                      body: 'unauthenticated',
                    };
                  }

                  next();
                },
                () => ({
                  body: 'authenticated',
                }),
              ],
            },
          },
        ],
      });

      await request(app)
        .get('/')
        .expect(201)
        .expect('works');

      await request(app)
        .get('/foo')
        .set('authentication', 'token')
        .expect(200)
        .expect('authenticated');

      return request(app)
        .get('/foo')
        .expect(401)
        .expect('unauthenticated');
    });
    it('returns json body', async () => {
      const { app } = await simpleExpress({
        port: freePorts[2],
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
        port: freePorts[3],
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
    it('gets next to work as middleware', async () => {
      const { app } = await simpleExpress({
        port: freePorts[4],
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
        port: freePorts[5],
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
        port: freePorts[6],
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
});
