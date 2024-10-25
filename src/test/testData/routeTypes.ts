import { Routes } from '../../types';

const arrayOfObjects: Routes = [
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
    path: '/foo/bar',
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
  {
    path: '/method',
    handlers: {
      get: () => ({ body: 'works get' }),
      post: () => ({ body: 'works post' }),
      delete: () => ({ body: 'works delete' }),
      put: () => ({ body: 'works put' }),
    },
  },
  {
    path: '/allmethods',
    handlers: {
      use: () => ({ body: 'works use' }),
    },
  },
];
const arrayOfArrays: Routes = [
  ['/', {
    get: () => ({
      body: 'works',
      status: 201,
    }),
  }],
  ['/foo/bar', {
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
  }],
  ['/method', {
    get: () => ({ body: 'works get' }),
    post: () => ({ body: 'works post' }),
    delete: () => ({ body: 'works delete' }),
    put: () => ({ body: 'works put' }),
  }],
  ['/allmethods', {
    use: () => ({ body: 'works use' }),
  }],
];
const objectOfObjects: Routes = {
  '/': {
    get: () => ({
      body: 'works',
      status: 201,
    }),
  },
  '/foo/bar': {
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
  '/method': {
    get: () => ({ body: 'works get' }),
    post: () => ({ body: 'works post' }),
    delete: () => ({ body: 'works delete' }),
    put: () => ({ body: 'works put' }),
  },
  '/allmethods': {
    use: () => ({ body: 'works use' }),
  },
};
const arrayOfObjectsNested: Routes = [
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
    routes: [
      {
        path: '/bar',
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
      }
    ],
  },
  {
    path: '/method',
    handlers: {
      get: () => ({ body: 'works get' }),
      post: () => ({ body: 'works post' }),
      delete: () => ({ body: 'works delete' }),
      put: () => ({ body: 'works put' }),
    },
  },
  {
    path: '/allmethods',
    handlers: {
      use: () => ({ body: 'works use' }),
    },
  },
];
const arrayOfObjectsNestedObjectOfObjects: Routes = [
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
    routes: {
      '/bar': {
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
  },
  {
    path: '/method',
    handlers: {
      get: () => ({ body: 'works get' }),
      post: () => ({ body: 'works post' }),
      delete: () => ({ body: 'works delete' }),
      put: () => ({ body: 'works put' }),
    },
  },
  {
    path: '/allmethods',
    handlers: {
      use: () => ({ body: 'works use' }),
    },
  },
];
const arrayOfArraysNested: Routes = [
  [
    '/',
    {
      get: () => ({
        body: 'works',
        status: 201,
      }),
    },
  ],
  [
    '/foo',
    [
      '/bar',
      {
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
    ],
  ],
  ['/method', {
    get: () => ({ body: 'works get' }),
    post: () => ({ body: 'works post' }),
    delete: () => ({ body: 'works delete' }),
    put: () => ({ body: 'works put' }),
  }],
  ['/allmethods', {
    use: () => ({ body: 'works use' }),
  }],
];
const arrayOfArraysNested2: Routes = [
  [
    '/',
    {
      get: () => ({
        body: 'works',
        status: 201,
      }),
    },
  ],
  [
    '/foo',
    [
      [
        '/bar',
        {
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
      ]
    ],
  ],
  [
    ['/method', {
      get: () => ({ body: 'works get' }),
      post: () => ({ body: 'works post' }),
      delete: () => ({ body: 'works delete' }),
      put: () => ({ body: 'works put' }),
    }],
    ['/allmethods', {
      use: () => ({ body: 'works use' }),
    }],
  ]
];
const arrayOfArraysNestedObjectOfObjects: Routes = [
  [
    '/',
    {
      get: () => ({
        body: 'works',
        status: 201,
      }),
    },
  ],
  [
    '/foo',
    {
      '/bar': {
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
  ['/method', [
    ['/', {
      get: () => ({ body: 'works get' }),
      post: () => ({ body: 'works post' }),
      delete: () => ({ body: 'works delete' }),
      put: () => ({ body: 'works put' }),
    }],
  ]],
  ['/allmethods', [
    ['/', {
      use: () => ({ body: 'works use' }),
    }]
  ]],
];
const objectOfObjectsNested: Routes = {
  '/': {
    get: () => ({
      body: 'works',
      status: 201,
    }),
  },
  '/foo': {
    '/bar': {
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
  '/method': {
    '/': {
      get: () => ({ body: 'works get' }),
      post: () => ({ body: 'works post' }),
      delete: () => ({ body: 'works delete' }),
      put: () => ({ body: 'works put' }),
    }
  },
  '/allmethods': {
    '/': {
      use: () => ({ body: 'works use' }),
    }
  },
};
const objectOfArraysNested: Routes = {
  '/': {
    get: () => ({
      body: 'works',
      status: 201,
    }),
  },
  '/foo': [
    '/bar',
    {
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
  ],
  '/method': ['/', {
    get: () => ({ body: 'works get' }),
    post: () => ({ body: 'works post' }),
    delete: () => ({ body: 'works delete' }),
    put: () => ({ body: 'works put' }),
  }],
  '/allmethods': ['/', {
    use: () => ({ body: 'works use' }),
  }],
};
const objectOfArraysNestedWithMiddleware: Routes = {
  '/': {
    get: () => ({
      body: 'works',
      status: 201,
    }),
  },
  '/foo': [
    '/bar',
    ({ getHeader, next }) => {
      if (getHeader('authentication') !== 'token') {
        return {
          status: 401,
          body: 'unauthenticated',
        };
      }

      next();
    },
    {
      get: () => ({
        body: 'authenticated',
      }),
    },
  ],
  '/method': ['/', {
    get: () => ({ body: 'works get' }),
    post: () => ({ body: 'works post' }),
    delete: () => ({ body: 'works delete' }),
    put: () => ({ body: 'works put' }),
  }],
  '/allmethods': ['/', {
    use: () => ({ body: 'works use' }),
  }],
};
const objectOfArraysNested2: Routes = {
  '/': {
    get: () => ({
      body: 'works',
      status: 201,
    }),
  },
  '/foo': [
    [
      '/bar',
      {
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
    ],
  ],
  '/method': ['/', {
    get: () => ({ body: 'works get' }),
    post: () => ({ body: 'works post' }),
    delete: () => ({ body: 'works delete' }),
    put: () => ({ body: 'works put' }),
  }],
  '/allmethods': ['/', {
    use: () => ({ body: 'works use' }),
  }],
};
const arrayOfArraysNestedWithMiddleware: Routes = [
  [
    '/',
    {
      get: () => ({
        body: 'works',
        status: 201,
      }),
    },
  ],
  [
    '/foo',
    [
      ({ getHeader, next }) => {
        if (getHeader('authentication') !== 'token') {
          return {
            status: 401,
            body: 'unauthenticated',
          };
        }

        next();
      },
      [
        '/bar',
        {
          get: [
            () => ({
              body: 'authenticated',
            }),
          ],
        },
      ]
    ],
  ],
  ['/method', {
    get: () => ({ body: 'works get' }),
    post: () => ({ body: 'works post' }),
    delete: () => ({ body: 'works delete' }),
    put: () => ({ body: 'works put' }),
  }],
  ['/allmethods', {
    use: () => ({ body: 'works use' }),
  }],
];
const arrayOfArraysNestedWithMiddleware2: Routes = [
  [
    '/',
    {
      get: () => ({
        body: 'works',
        status: 201,
      }),
    },
  ],
  [
    '/foo',
    ({ getHeader, next }) => {
      if (getHeader('authentication') !== 'token') {
        return {
          status: 401,
          body: 'unauthenticated',
        };
      }

      next();
    },
    [
      '/bar',
      {
        get: [
          () => ({
            body: 'authenticated',
          }),
        ],
      },
    ]
  ],
  ['/method', {
    get: () => ({ body: 'works get' }),
    post: () => ({ body: 'works post' }),
    delete: () => ({ body: 'works delete' }),
    put: () => ({ body: 'works put' }),
  }],
  ['/allmethods', {
    use: () => ({ body: 'works use' }),
  }],
];


export const routeStyles: Record<string, Routes> = {
  arrayOfObjects,
  arrayOfArrays,
  objectOfObjects,
  arrayOfObjectsNested,
  arrayOfObjectsNestedObjectOfObjects,
  arrayOfArraysNested,
  arrayOfArraysNested2,
  arrayOfArraysNestedObjectOfObjects,
  objectOfObjectsNested,
  objectOfArraysNested,
  objectOfArraysNestedWithMiddleware,
  objectOfArraysNested2,
  arrayOfArraysNestedWithMiddleware,
  arrayOfArraysNestedWithMiddleware2,
};
