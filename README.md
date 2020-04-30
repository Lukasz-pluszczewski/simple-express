# Simple Express framework
> Simple micro framework based on Express, allowing you to prototype APIs blazingly quickly

![Express Logo](logo.png)

Micro-framework that let's you create more readable route structure, use simple async functions as route handlers, with clear error handling and run fully functional express app in seconds.

## Getting started
### Install the library
`npm i simple-express-framework`

### Run the hello-world app
```js
import simpleExpress from 'simple-express-framework';

simpleExpress({
  port: 8080,
  routes: [
    ['/hello', {
      get: () => ({ status: 200, body: 'Hello world' }),
    }],
  ],
});
```

And that's all! Express server, listening on chosen port, with [reasonable default settings](#config) is up and running in seconds!

But that's not all! Dive in in the [Examples](#more-usage-examples) section to see the power of [simple and readable route handlers](#examples-of-handlers), [clear error handling](#error-Handlers) and more - everything just works!

## Table of contents
* [Getting started](#getting-started)
* [Table of contents](#table-of-contents)
* [Usage](#usage)
   * [simpleExpress function](#simpleexpress-function)
   * [simpleExpress config](#simpleexpress-config)
   * [Handlers](#handlers)
      * [Response objects](#response-objects)
      * [Returning error](#returning-error)
      * [Examples of handlers:](#examples-of-handlers)
      * [Multiple handlers (middlewares)](#multiple-handlers-middlewares)
   * [Error Handlers](#error-handlers)
      * [handleError helper](#handleerror-helper)
   * [Routes](#routes)
      * [Array of arrays (recommended)](#array-of-arrays-recommended)
      * [Array of objects](#array-of-objects)
      * [Object of objects](#object-of-objects)
      * [Reserved object keys](#reserved-object-keys)
   * [Config](#config)
   * [Global Middlewares](#global-middlewares)
* [More usage examples](#more-usage-examples)
   * [Hello world](#hello-world)
   * [Simple users CRUD](#simple-users-crud)
   * [Adding authentication](#adding-authentication)
   * [Adding authentication to one route only](#adding-authentication-to-one-route-only)
   * [Error handling](#error-handling)
   * [Disabling default middlewares](#disabling-default-middlewares)
   * [Applying express middlewares](#applying-express-middlewares)
   * [Sending response manually](#sending-response-manually)
   * [Request validation](#request-validation)
      * [Built-in prop-types helper](#built-in-prop-types-helper)
      * [Express-validator](#express-validator)
   * [Logging](#logging)
   * [Testing the app](#testing-the-app)
* [Development](#development)
* [Changelog](#changelog)

## Usage

### SimpleExpress function
You run the app by executing simpleExpress function. All options are optional.

```js
import simpleExpress from 'simple-express-framework';

simpleExpress({
  port: 8080,
  routes,
  expressMiddleware,
  middleware,
  errorHandlers,
  config,
  routeParams,
  app,
  server,
})
  .then(({ app, server }) => console.log('App started :)'))
  .catch(error => console.error('App starting failed :(', error));
```

### simpleExpress config
Simple express accepts the following options:
- **port**: *number* Port for the app to listen on. Not required, you can run the app without a port (useful for testing)
- **routes**: *object|array* See [Routes](#routes)
- **expressMiddleware**: *array* Array of express middlewares (functions accepting req, res, and next as arguments)
- **middleware**: *array* Array of simpleExpress middlewares (see [Handlers](#handlers))
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
- **method**: *string* Request's method
- **originalUrl**: *string* Request's original url
- **protocol**: *string* Request's protocol
- **xhr**: *boolean* Flag indicating the request is XHR request
- **get**: *function* Function returning the request header
- **getHeader**: *function* Alias for get()
- **locals**: *object* [res.locals](https://expressjs.com/en/api.html#res.locals) object for storing data for current request
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

Or throw an Error (or instance of a class extending Error)
```js
() => {
  throw new Error('Something went wrong');
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

      // the same as "next(new AuthenticationError('Unauthenticated'))"
      return new AuthenticationError('Unauthenticated');
    },
    ({ locals }) => ({
      body: 'You are logged in as ' + locals.user.username,
    }),
  ]
}
```

Middlewares can be chained in different ways:
```js
[
  [
    '/foo',
    ({ getHeader, locals, next }) => {
      const user = verifyToken(getHeader('authentication'))
      if (user) {
        locals.user = user;
        return next();
      }

      // the same as "next(new AuthenticationError('Unauthenticated'))"
      return new AuthenticationError('Unauthenticated');
    },
    {
      get: ({ locals }) => ({
        body: 'You are logged in as ' + locals.user.username,
      }),
    }
  ]
]
```

```js
[
  '/foo',
  [
    ({ getHeader, locals, next }) => {
      const user = verifyToken(getHeader('authentication'))
      if (user) {
        locals.user = user;
        return next();
      }

      // the same as "next(new AuthenticationError('Unauthenticated'))"
      return new AuthenticationError('Unauthenticated');
    },
    {
      get: ({ locals }) => ({
        body: 'You are logged in as ' + locals.user.username,
      }),
    }
  ]
]
```

### Error Handlers
All errors are being caught by the simpleExpress and passed to error handlers. Error handlers are identical to handlers, except they receive error as first argument, and object of handler parameters as second. To pass an error to error handlers you can trigger `next()` with an error as an argument, throw an error, or return an error in a handler.

*Please note, that handler parameters object is exactly the same as in case of handlers, except 'params' field which is for whatever reason stripped by express.*

```js
routes: [
  ['/foo', {
    get: () => {
      throw new AuthenticationError();
    }
  }],
  ['/bar', {
    get: () => new AuthenticationError(),
  }],
  ['/baz', {
    get: ({ next }) => next(new AuthenticationError()),
  }]
]

errorHandlers: [
  (error, { next }) => {
    if (error instanceOf AuthenticationError) {
      return {
        status: 401,
        body: 'Unauthorized',
      };
    }

    return error;
  },
  (error) = {
    return {
      status: 500,
      body: 'Ups :('
    };
  }
]
```

#### handleError helper
To make it easier for you to handle different types of errors, simpleExpress provides you with handleError helper:
```js
import { handleError } from 'simple-express-framework';

//...

errorHandlers: [
  handleError(
    AuthenticationError,
    (error, { query, body, params, ... }) => ({
      status: 401,
      body: 'Unauthorized',
    })
  )
  (error) => ({
    status: 500,
    body: 'Ups :('
  }),
]
```

You can also pass an array of error - errorHandler pairs to handleError helper function
```js
import { handleError } from 'simple-express-framework';

//...

errorHandlers: [
  handleError([
    [AuthenticationError, (error, { query, body, params, ... }) => ({
      status: 401,
      body: 'Unauthorized',
    })],
    [
      (error) => ({
        status: 500,
        body: 'Ups :('
      }),
    ]
  ])
]
```

```js
import { handleError } from 'simple-express-framework';

//...

errorHandlers: handleError([
  [AuthenticationError, (error, { query, body, params, ... }) => ({
    status: 401,
    body: 'Unauthorized',
  })],
  (error) => ({
    status: 500,
    body: 'Ups :('
  }),
])
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
**Warning:** *Object keys' order is preserved only for string and symbols keys, not for integers (integers, including in strings like "1", will always be before all other keys)!*
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

#### Reserved object keys
Because object keys can be used as route paths but also as method names (like get, post etc.) or as names like path, handlers and routes here is the list of reserved key names that can't be used as route paths when you use "Object of objects" format:

*Please note that all of those can be used with slash at the beginning like `/path` or `/post`. Only exactly listed strings are reserved.*
- path
- handlers
- routes
- use
- get
- post
- put
- delete
- del
- options
- patch
- head
- checkout
- copy
- lock
- merge
- mkactivity
- mkcol
- move
- m-search
- notify
- purge
- report
- search
- subscribe
- trace
- unlock
- unsubscribe

If you need to register a route with one of these strings as path, you can use one of the other route formats.

### Config
By default, JSON body parser, cors and cookie parser middlewares are configured. You can change their configuration or disable them.
`config` object consist of the following fields:
- **cors**: *object|false* cors config. If set to `false`, the cors middleware will not by applied.
- **jsonBodyParser**: *object|false* JSON body parser config. If set to `false` the body parser middleware will not be applied.
- **cookieParser**: *[secret, options]|false* Arguments for cookie-parser middleware. If set to `false` the cookie parser middleware will not be applied.

### Global Middlewares
Global middlewares can be added in `middleware` field. It is array of handlers (each handlers looks exactly like route handlers, with the same parameters).
```js
simpleExpress({
  port: 8080,
  middleware
  ...
})
```

If you need to use express middlewares directly, you can pass them to expressMiddleware array.

## More usage examples
### Hello world
```js
import simpleExpress from 'simple-express-framework';

simpleExpress({
  port: 8080,
  routes: [
    ['/', {
      get: () => ({ body: 'Hello world!' }),
    }],
  ],
})
```

### Simple users CRUD
```js
import simpleExpress from 'simple-express-framework';

import connectDb from './connectDb';
import createUsersRepository from './usersRepository';

const db = connectDb();
const usersRepository = createUsersRepository(db);

simpleExpress({
  port: 8080,
  routeParams: { users: usersRepository },
  routes: [
    ['/users', {
      get: async ({ query: { search }, users }) => {
        const allUsers = await users.getAll(search);

        return {
          body: allUsers,
        };
      },
      post: async ({ body, users }) => {
        const results = await users.create(body);

        return {
          status: 201,
          body: results,
        };
    }],
    ['users/:id', {
      get: async ({ params: { id }, users }) => {
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
      put: async ({ params: { id }, body, users }) => {
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
    }],
  ],
})
```

### Adding authentication
```js
import simpleExpress from 'simple-express-framework';
import verifyToken from 'verifyToken';

simpleExpress({
  port: 8080,
  middleware: [
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
    ['/users', {
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
    }],
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
    ['/users/:id', {
      get: async ({ params }) => {
        const { id } = params;
        const user = await users.getById(id);

        if (user) {
          return {
            body: user,
          };
        }

        return new NotFoundError('User not found');
      },
    }],
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

      return error;
    },
    (error) => (){
      status: 500,
      body: error.message || 'Unknown error',
    }),
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
    cookieParser: false,
  },
  routes: [
    ...
  ],
});
```

### Applying express middlewares
Cors, JSON body parser and cookie parser are configured by default
```js
import simpleExpress from 'simple-express-framework';
import morgan from 'morgan';

simpleExpress({
  port: 8080,
  expressMiddleware: [
    morgan('combined'),
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
    ['/foo', {
      get: ({ res }) => {
        res.write('<div>Hello foo</div>');
        res.end();
      },
    }],
    ['/bar', {
      get: ({ res }) => {
        res.write('<div>Hello baz</div>');
        res.end();

        return null;
      },
    }],
    ['/baz', {
      get: ({ res }) => {
        res.write('<div>Hello baz</div>');
        res.end();

        return {
          format: none,
        };
      },
    }],
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
    ['/:bam', {
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
    }],
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
    ['/user', {
      post: [
        wrapMiddleware([
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
    }],
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
- `DEBUG=simpleExpress:warning`: Unimplemented features, deprecations and other warnings

### Testing the app
See the demo app for tests examples.

## Development
- Clone the repository
- `npm i`

**Running tests**
`npm run test`

**Starting demo app**
`npm run demo`

## Changelog

### 2.1.0
- Added more features to handleError helper (handling unknown error, passing more error - errorHandler pairs)
- Added more tests for handleError helper
- Added table of contents in readme
- Some minor improvements in readme
- Small fixes

### 2.0.4
- Added logo

### 2.0.3
- Fixed issue with `use` method not being supported
- Updated tests

### 2.0.2
- DEPRECATION: `simpleExpressMiddlewares` and `middlewares` options are deprecated, use `middleware` instead
- DEPRECATION: `expressMiddlewares` option is deprecated, use `expressMiddleware` instead
- All middlewares can now be nested
- Added more tests
- Improved readme

### 2.0.1
- improved stats log
- updated tests

### 2.0.0
- Added support for nested routes, in many shapes
- Updated tests to cover different nested routes schemas
- Added `type` response field
- Changed default response method to `send`
- Updated readme
- Update demo app - now it's complete application with tests

### 1.0.3
- Exposed res.locals to route handlers and error handlers as "locals"
- Added more tests for error handlers

### 1.0.2
- Minor fixes
