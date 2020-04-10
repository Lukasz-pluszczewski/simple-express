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
  ],
  arrayOfArrays: [
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
      '/foo/bar',
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
    ]
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
  ],
};
