## Usage
### Usage example - Simple users CRUD
```js
import simpleExpress from 'simple-express-framework';
import protect from 'authenticate';
import connectDB from 'connectDB';
import createUsersRepository from 'usersRepository';

const DB = connectDB();
const usersRepository = createUsersRepository(db);

simpleExpress({
  port: 8080,
  routeParams: { usersRepository },
  routes: [
    ['/users', {
      get: async ({ query: { search }, usersRepository }) => {
        const allUsers = await usersRepository.getAll(search);

        return {
          body: allUsers,
        };
      },
      post: async ({ body, usersRepository }) => {
        const results = await usersRepository.create(body);

        return {
          status: 201,
          body: results,
        };
    }],
    ['users/:id', {
      get: async ({ params: { id }, usersRepository }) => {
        const user = await usersRepository.getById(id);

        if (user) {
          return {
            body: user,
          };
        }

        return {
          status: 404,
          body: 'User not found',
        };
      },
      put: async ({ params: { id }, body, usersRepository }) => {
        const { id } = params;
        const result = await usersRepository.updateById(id, body);

        if (result) {
          return {
            status: 204,
          };
        }

        return {
          status: 404,
          body: 'User not found',
        };
      },
    }],
  ],
})
```

### SimpleExpress function
You run the app by executing simpleExpress function. All options are optional.

```js
import simpleExpress from 'simple-express-framework';

simpleExpress({
  port: 8080,
  routes,
  expressMiddlewares,
  globalMiddlewares,
  errorHandlers,
  config,
  routeParams,
  app,
  server,
})
  .then(({ app }) => console.log('App started'))
  .catch(error => console.error('App starting failed :(', error));
```

### simpleExpress config
Simple express accepts the following options:
- **port**: *number* Port for the app to listen on. Not required, you can run the app without a port (useful for testing)
- **routes**: *object|array* See [Routes](#routes)
- **expressMiddlewares**: *array* Array of express middlewares (functions accepting req, res, and next as arguments)
- **globalMiddlewares**: *array* Array of simpleExpress middlewares (see [Handlers](#handlers))
- **errorHandlers**: *array* Array of simpleExpress error middlewares (see [Error Handlers](#error-handlers))
- **config**: *object* See [Config](#config)
- **routeParams**: *object* Object of additional parameters passed to handlers
- **app**: **object** Custom app to be used (by default new express app is created)
- **server**: **object** Custom http server to be used (by default new http server is created)

### Handlers
SimpleExpress handlers are similar to express handlers except they accept one argument: object with the following fields:
- **body**: *any* Request's body (by default, the json parser is enabled)
- **query**: *object* Request's query parameters
- **params**: *object* Route params
- **originalUrl**: *string* Request's original url
- **protocol**: *string* Request's protocol
- **xhr**: *boolean* Flag indicating the request is XHR request
- **get**: *function* Function returning the request header
- **getHeader**: *function* Alias for get()
- **next**: *function* Express' next function, triggers next middleware
- **req**: *object* Express' req object
- **res**: *object* Express' res object

#### Response objects
Handlers should return the response object:
- **status**: *number* (default: 200) Response http status code
- **body**: *any* Response body (By default weill be sent using [res.send() method](https://expressjs.com/en/api.html#res.send). Can be changed with method field)
- **headers**: *object* Response headers
- **redirect**: *string* Url to redirect to
- **type**: *string* Passes the value to `res.type()` express method which sets the Content-Type HTTP header to the value received if it contains '/' (e.g. `application/json`), or determines the mime type by [mime.lookup\(\)](https://github.com/broofa/node-mime#mimelookuppath)
- **method**: *string* Response method, one of the following values:
  - *json* - the response will be sent using `res.json` method
  - *send* - the response will be sent using `res.send` method
  - *default* - alias for send
  - *none* - the response will not be sent (useful if you want to send a response manually), the same effect can be achieved by returning falsy value from handler.

#### Returning error
To pass an error to error handlers, handler can either pass an error to next() function:
```js
({ next }) => {
  next(new Error('Something went wrong'));
};
```

Or just return an Error object (or instance of a class extending Error)
```js
() => {
  return new Error('Something went wrong');
};
```

#### Examples of handlers:
```js
({ req, res, params, body, query, originalUrl, protocol, locals, xhr, getHeader, next }) => {
  ...
  return {
    status: 500,
    body: { message: 'Server error' },
    headers: { customHeader: 'customHeaderValue' },
  };
};
```

```js
({ params, body }) => {
  ...
  return {
    status: 301,
    redirect: '/test',
  };
};
```

```js
({ params, body }) => {
  ...
  return {
    body: Buffer.from('LoremIpsum')
  };
};
```

```js
({ res, next }) => {
  ...
  res.sendFile('path/to/file', error => {
    if (error) {
      next(error);
    }
  });
};
```

#### Multiple handlers (middlewares)
All handlers can work as middlewares if they trigger next() instead of returning a response. You can pass an array of handlers. They will be executed in order just like express middlewares.

```js
{
  get: [
    ({ getHeader, locals, next }) => {
      const user = verifyToken(getHeader('authentication'))
      if (user) {
        locals.user = user;
        return next();
      }
      return new AuthenticationError('Unauthenticated'); // the same as "next(new AuthenticationError('Unauthenticated'))"
    },
    ({ locals }) => ({
      body: 'You are logged in as ' + locals.user.username,
    }),
  ]
}
```

### Error Handlers
All errors are being caught by the simpleExpress and passed to error handlers.

Error handlers are identical to handlers, except they receive error as first argument, and object of params as second.

```
errorHandlers: [
  (error, { next }) => {
    if (error instanceOf AuthenticationError) {
      return {
        status: 401,
        body: 'Unauthorized',
      };
    }
    next(error);
  },
  (error) = {
    return {
      status: 500,
      body: 'Ups :('
    };
  }
]
```

### Routes
The simpleExpress supports different formats of routes (in first two formats, paths can be either strings or regular expressions):

#### Array of arrays (recommended)
```js
simpleExpress({
  routes: [
    ['/foo', {
      get: [authenticate, () => ({ body: 'some data' })]
      post: [authenticate, () => ({ status: 201 })]
    }],
    ['/bar/:baz', {
      get: ({ params }) => ({ body: `Got ${params.baz}` })
    }]
  ]
});
```

#### Array of objects
```js

simpleExpress({
  routes: [
    {
      path: '/foo',
      handlers: {
        get: [authenticate, () => ({ body: 'some data' })],
        post: [authenticate, () => ({ status: 201 })],
      },
    },
    {
      path: '/bar/:baz',
      handlers: {
        get: ({ params }) => ({ body: `Got ${params.baz}` }),
      },
    },
  ],
});
```

#### Object of objects
**Warning** Object keys' order is preserved only for string and symbols keys, not for integers (integers, including in strings like "1", will always be before all other keys)!
```js

simpleExpress({
  routes: {
    '/foo': {
      get: [authenticate, () => ({ body: 'some data' })]
      post: [authenticate, () => ({ status: 201 })]
    },
    '/bar/:baz': {
      get: ({ params }) => ({ body: `Got ${params.baz}` }),
    },
  },
});
```

### Config
By default, JSON body parser and cors middlewares are configured. You can change their configuration or disable them.
`config` object consist of the following fields:
- **cors**: *object|false* cors config. If set to `false`, the cors middleware will not by applied.
- **jsonBodyParser**: *object|false* JSON body parser config. If set to `false` the body parser middleware will not be applied.
- **cookieParser**: *[secret, options]|false* Arguments for cookie-parser middleware. If set to `false` the cookie parser middleware will not be applied.

### Global Middlewares
Global middlewares can be added in `globalMiddleware` field. It is array of handlers (each handlers looks exactly like route handlers, with the same parameters).
If you need to use express middlewares directly, you can pass them to expressMiddlewares array.

## Usage examples
### Hello world
```js
import simpleExpress from 'simple-express-framework';

simpleExpress({
  port: 8080,
  routes: [
    {
      path: '/',
      handlers: {
        get: () => ({ body: 'Hello world!' }),
      },
    },
  ],
})
```

### Simple users CRUD
```js
import simpleExpress from 'simple-express-framework';
import users from 'users';

simpleExpress({
  port: 8080,
  routes: [
    {
      path: '/',
      handlers: {
        get: () => ({ body: 'Hello world!' }),
      },
    },
    {
      path: 'users',
      handlers: {
        get: async ({ query }) => {
          const { search } = query;
          const allUsers = await users.getAll(search);

          return {
            body: allUsers,
          };
        },
        post: async ({ body }) => {
          const results = await users.create(body);

          return {
            status: 201,
            body: results,
          };
        },
      }
    },
    {
      path: 'users/:id',
      handlers: {
        get: async ({ params }) => {
          const { id } = params;
          const user = await users.getById(id);

          if (user) {
            return {
              body: user,
            };
          }

          return {
            status: 404,
            body: 'User not found',
          };
        },
        put: async ({ body, params }) => {
          const { id } = params;
          const result = await users.updateById(id, body);

          if (result) {
            return {
              status: 204,
            };
          }

          return {
            status: 404,
            body: 'User not found',
          };
        },
      },
    },
  ],
})
```

### Adding authentication
```js
import simpleExpress from 'simple-express-framework';
import verifyToken from 'verifyToken';

simpleExpress({
  port: 8080,
  globalMiddlewares: [
    ({ get, next }) => {
      if (verifyToken(get('authentication'))) {
        return next();
      }

      return {
        status: 401,
        body: 'Unauthorized',
      };
    },
  ],
  routes: [
    ...
  ],
})
```

### Adding authentication to one route only
```js
import simpleExpress from 'simple-express-framework';
import users from 'users';
import verifyToken from 'verifyToken';

simpleExpress({
  port: 8080,
  routes: [
    ...
    {
      path: 'users',
      handlers: {
        get: [
          ({ get, next }) => {
            if (verifyToken(get('authentication'))) {
              return next();
            }

            return {
              status: 401,
              body: 'Unauthorized',
            };
          },
          async ({ query }) => {
            const { search } = query;
            const allUsers = await users.getAll(search);

            return {
              body: allUsers,
            };
          },
        ]
      }
    },
    ...
  ],
});
```

### Error handling
```js
import simpleExpress from 'simple-express-framework';
import users from 'users';
import NotFoundError from 'errors/NotFoundError';

simpleExpress({
  port: 8080,
  routes: [
    ...
    {
      path: 'users/:id',
      handlers: {
        get: async ({ params }) => {
          const { id } = params;
          const user = await users.getById(id);

          if (user) {
            return {
              body: user,
            };
          }

          throw new NotFoundError('User not found');
        },
      },
    },
    ...
  ],
  errorHandlers: [
    (error, { next }) => {
      if (error instanceof NotFoundError) {
        return {
          status: 404,
          body: error.message,
        };
      }

      next(error);
    },
    (error) => {
      return {
        status: 500,
        body: error.message || 'Unknown error',
      };
    },
  ],
});
```

You can pass the error to `next` callback, return it or throw. In each case, error handlers will get the error.
```js
const handler = ({ next }) => {
  next(new Error('Error'));
};

const handler = () => {
  return new Error('Error');
};

const handler = () => {
  throw new Error('Error');
};
```

### Disabling default middlewares
```js
import simpleExpress from 'simple-express-framework';

simpleExpress({
  port: 8080,
  config: {
    jsonBodyParser: false,
    cors: false,
  },
  routes: [
    ...
  ],
});
```

### Applying express middlewares
Cors ({origin: true, credentials: true, exposedHeaders: ['Link', 'Jwt']}) and JSON body parser ({limit: '300kb'}) are configured by default
```js
import simpleExpress from 'simple-express-framework';
import cookieParser from 'cookie-parser';

simpleExpress({
  port: 8080,
  expressMiddlewares: [
    cookieParser(),
  ],
  routes: [
    ...
  ],
});
```

### Sending response manually
```js
import simpleExpress from 'simple-express-framework';

simpleExpress({
  port: 8080,
  routes: [
    {
      path: '/',
      handlers: {
        get: ({ res }) => {
          res.write('<div>Hello world</div>');
          res.end();

          // no return
          // or
          return null;
          // or
          return {
            format: none,
          };
        },
      },
    },
  ],
})
```

### Request validation
#### Built-in prop-types helper
```js
import simpleExpress, { ValidationError, checkPropTypes } from 'simple-express';

const { app } = await simpleExpress({
  port: 8080,
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
```

#### Express-validator
```js
import simpleExpress, { wrapMiddleware } from 'simple-express';
const { check, validationResult } = require('express-validator');

const { app } = await simpleExpress({
  port: 8080,
  routes: [
    {
      path: '/user',
      handlers: {
        post: [
          ...wrapMiddleware([
            check('username').isEmail(),
            check('password').isLength({ min: 5 })
          ]),
          ({ req, next }) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
            }

            next();
          },
          () => ({
            body: 'works'
          })
        ],
      },
    },
  ],
});
```

### Logging
This library uses [debug](https://github.com/visionmedia/debug) logging utility.

To enable all logs set the following environment variable:
```bash
DEBUG=simpleExpress,simpleExpress:*
```

You can enable only some logs:
- `DEBUG=simpleExpress`: General logs (like "App started on port", or "ERROR: port already in use")
- `DEBUG=simpleExpress:request`: Log all requests with response time
- `DEBUG=simpleExpress:stats`: Simple express statistics, like registered routes, middlewares etc.
- `DEBUG=simpleExpress:warning`: Unimplemented features and other warning

### Testing the app
To be able to test your app with tool like supertest, you need to export `app`.

Note that you don't have to pass the "port" parameter to simpleExpress function. App will not listen on any port but you will be able to test it using supertest.

#### app.js
```js
import simpleExpress from '../lib';

const runApp = async () => {
  const { app } = await simpleExpress({
    routes: [
      {
        path: '/',
        handlers: {
          get: () => ({ body: 'works' }),
        }
      }
    ],
  });

  return app;
};

export default runApp;
```

#### index.js
```js
import runApp from './app';

runApp();
```

#### app.test.js
```js
import request from 'supertest';
import runApp from '../App';

it('works', async () => {
  const app = await runApp();

  return request(app)
    .get('/')
    .expect(200)
    .expect('works');
});
```

## Development
- Clone the repository
- `npm i`
- `npm run test`

## Changelog

### 2.0.0
- Added support for nested routes, in many shapes
- Updated tests to cover different nested routes schemas
- Added `type` response field
- Changed default response method to `send`
- Updated readme

### 1.0.3
- Exposed res.locals to route handlers and error handlers as "locals"
- Added more tests for error handlers

### 1.0.2
Minor fixes
