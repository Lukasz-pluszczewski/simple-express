import simpleExpress from '../lib';
import simpleExpressTypes from '../../index';

const runApp = async () => {
  return simpleExpress({
    port: process.env.PORT || 8080,
    routes: [],
  }).then(({ app }) => {
    console.log('Demo app running');
    return app;
  });
};

export default runApp;
