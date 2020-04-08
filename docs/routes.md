### Handlers
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

### Routes
Routes can be nested. Simple express supports different formats of routes.

Below are examples of different route formats. All of the examples will resolve the following routes '/', '/foo/bar', '/foo/baz/bam'.

#### Array of arrays (recommended)
```js
const routes = [
  [
    '/',
    {
      get: () => ({ body: 'Working' })
    }
  ],
  [
    '/foo',
    [
      [
        '/bar',
        {
          get: () => ({ body: 'Nested routes work too' })
        }
      ],
      [
        '/baz',
        [
          '/bam',
          {
            get: () => ({ body: 'Even more nested routes' })
          }
        ]
      ]
    ]
  ]
];
```

Thanks to nesting, you can split your routes into separate variables/files like this:

```js
const fooRoutes = [
  [
    '/bar',
    {
      get: () => ({ body: 'Nested routes work too' })
    }
  ],
  [
    '/baz',
    [
      '/bam',
      {
        get: () => ({ body: 'Even more nested routes' })
      }
    ]
  ]
];

const routes = [
  [
    '/',
    {
      get: () => ({ body: 'Working' })
    }
  ],
  [
    '/foo',
    fooRoutes
  ]
];
```

*NOTE* The '/bam' subroute is not nested in additional array (unlike '/baz'). If there is only one subroute, the additional array is not needed, although it's generally better to have it so that routes structure is consistent throughout the project.

#### Array of objects
```js
const routes = [
  {
    path: '/',
    handlers: {
      get: () => ({ body: 'Working' })
    },
  },
  {
    path: '/foo',
    routes: [
      {
        path: '/bar',
        handlers: {
          get: () => ({ body: 'Nested routes work too' })
        }
      },
      {
        path: '/baz',
        routes: [
          {
            path: '/bam',
            handlers: {
              get: () => ({ body: 'Even more nested routes' })
            }
          }
        ]
      },
    ],
  }
];
```

Split into separate variables/files
```js
const fooRoutes = [
  [
    {
      path: '/bar',
      handlers: {
        get: () => ({ body: 'Nested routes work too' })
      }
    },
    {
      path: '/baz',
      routes: [
        {
          path: '/bam',
          handlers: {
            get: () => ({ body: 'Even more nested routes' })
          }
        }
      ]
    },
  ],
];

const routes = [
  {
    path: '/',
    handlers: {
      get: () => ({ body: 'Working' })
    },
  },
  {
    path: '/foo',
    routes: fooRoutes,
  }
];
```
#### Object
In ECMAScript2015 order of object fields is preserved (except integer fields and string keys representing integers) so you can just put your paths into object keys:

```js
const routes = {
  '/': {
    get: () => ({ body: 'Working' }),
  },
  '/foo': {
    '/bar': {
      get: () => ({ body: 'Nested routes work too' }),
    },
    '/baz': {
      '/bam': {
        get: () => ({ body: 'Even more nested routes' })
      }
    }
  },
};
```

Split into separate variables/files:

```js
const fooRoutes = {
  '/bar': {
    get: () => ({ body: 'Nested routes work too' }),
  },
  '/baz': {
    '/bam': {
      get: () => ({ body: 'Even more nested routes' })
    }
  }
};

const routes = {
  '/': {
    get: () => ({ body: 'Working' }),
  },
  '/foo': fooRoutes,
};
```

#### Mixed
You can mix all of those formats, although this is **strongly discouraged**

_Not recommended_
```js
const routes = {
  '/': {
    get: () => ({ body: 'Working' }),
  },
  '/foo': [
    [
      '/bar',
      {
        get: () => ({ body: 'Nested routes work too' }),
      }
    ],
    [
      '/baz',
      {
        '/bam': {
          get: () => ({ body: 'Even more nested routes' })
        }
      }
    ]
  ],
};
```

#### Mixing routes with handlers

_Not recommended_
```js
const routes = {
  '/foo': {
    '/bar': {
      get: () => ({ body: 'This is /foo/bar endpoint' }),
    },
    get: () => ({ body: 'This is /foo endpoint' });
  },
};
```
