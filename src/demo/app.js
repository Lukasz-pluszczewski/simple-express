import simpleExpress from '../lib';
import routes from './routes';
import { getToken } from './services/authentication';
import getPostsRepository from './repositories/posts';
import authenticationErrorHandler from './errorHandlers/authenticationErrorHandler';
import notFoundErrorHandler from './errorHandlers/notFoundErrorHandler';
import generalErrorHandler from './errorHandlers/generalErrorHandler';


const runApp = async () => {
  const postsRepository = getPostsRepository();

  return simpleExpress({
    port: process.env.PORT || 8080,
    routes: routes,
    errorHandlers: [
      authenticationErrorHandler,
      notFoundErrorHandler,
      generalErrorHandler,
    ],
    routeParams: { getToken, postsRepository },
  }).then(({ app }) => {
    console.log('Demo app running');
    return app;
  });
};

export default runApp;
