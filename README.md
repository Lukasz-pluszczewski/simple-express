## Usage
### Basic usage
You can run the server just by executing the simpleExpress function.
```js
import simpleExpress from 'simple-express-framework';

simpleExpress({
  port: 8080,
  routes, // optional
  expressMiddlewares, // optional
  globalMiddlewares, // optional
  errorHandlers, // optional
  config, // optional
})
  .then(({ app }) => console.log(`App started`))
  .catch(error => console.error('App starting failed :(', error));
```
### Config
By default, JSON body parser and cors middlewares are configured. You can change their configuration or disable them.
`config` object consist of the following fields:
- **cors**: *object|false* (default: `{origin: true, credentials: true, exposedHeaders: ['Link', 'Jwt']}`) cors config. If set to false, the cors middleware will not by applied.
- **jsonBodyParser**: *object|false* (default: `{limit: '300kb'}`) JSON body parser config. If set to false the body parser middleware will not be applied.

### Routes
The simpleExpress accepts `routes` array. Each element in that array is an object:
- **path**: *string|RegExp* path string (supporting the same syntax as [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) - tool used by express to parse route paths)
- **handlers**: *object|array of object*:
  - **get|post|put|delete|use**: *function* Route handler. Receives an object as parameter, with the following fields:
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

Routes can also be an object with paths as keys and handlers object|array as values or array of arrays where first element is path and second is object of handlers (see examples below)

### Response
To send a response from route handler just return an object (or Promise that wil resolve to an object) with the following fields:
- **status**: *number* (default: 200) Response http status code
- **body**: *any* Response body (If it's string, number or boolean, it will be sent using express `res.send` method and `res.json` other wise. Can be changed with format field)
- **headers**: *object* Response headers
- **redirect**: *string* Url to redirect to
- **format**: *string* Response format, one of the following values:
  - *json* - the response will be sent using `res.json` method
  - *default* - alias for json
  - *send* - the response will be sent using `res.send` method
  - *none* - the response will not be sent (useful if you want to send a response manually)

### Middlewares
To add a middleware to a route, just pass an array of handlers to the `handlers` field in route. All handlers can also work as middlewares if they trigger next() instead of returning a response.
Global middlewares can be added in `globalMiddleware` field. It is array of handlers (each handlers looks exactly like route handlers, with the same parameters).

If you need to use express middlewares directly, you can pass them to expressMiddlewares array.

### Error handlers
All errors are being caught by the simpleExpress and passed to error handlers.

Array of error handlers can be passed to `errorHandler` field.

The error handler is a function that gets the following arguments:
- **error**: *Error|any* the error that has been provided to next function in any previous handler or the error that has been thrown.
- **params**: *object* object with the same parameters as all other handlers receive

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

### Routes formats:
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

#### Array of arrays
```js
simpleExpress({
  routes: [
    ['/foo', {
      get: [authenticate, () => ({ body: 'some data' })]
      post: [authenticate, () => ({ status: 201 })]
    }],
    ['/bar/:baz', { get: ({ params }) => ({ body: `Got ${params.baz}` }) }]
  ]
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

## Changelog

### 1.0.3
- Exposed res.locals to route handlers and error handlers as "locals"
- Added more tests for error handlers

### 1.0.2
Minor fixes
