export const routeStyles = {
  arrayOfObjects: [
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
  ],
  arrayOfArrays: [
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
  ],
  objectOfObjects: {
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
  },
  arrayOfObjectsNested: [
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
  ],
  arrayOfObjectsNestedObjectOfObjects: [
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
  ],
  arrayOfArraysNested: [
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
  ],
  arrayOfArraysNested2: [
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
  ],
  arrayOfArraysNestedObjectOfObjects: [
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
  ],
  objectOfObjectsNested: {
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
  },
  objectOfArraysNested: {
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
  },
  objectOfArraysNestedWithMiddleware: {
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
  },
  objectOfArraysNested2: {
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
  },
  arrayOfArraysNestedWithMiddleware: [
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
  ],
  arrayOfArraysNestedWithMiddleware2: [
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
  ],
};
