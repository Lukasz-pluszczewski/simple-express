import simpleExpress from '../lib';

const runApp = async () => {
  const { app } = await simpleExpress({
    port: 8080,
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
