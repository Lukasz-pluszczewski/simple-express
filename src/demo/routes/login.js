import { AuthenticationError } from "../errors";
import protect from '../services/authentication';

export default [
  ['/login', {
    get: [
      protect,
      ({ locals }) => ({ body: { user: locals.user } }),
    ],
    post: ({ body, getToken }) => {
      const result = getToken(body.login, body.password);
      if (result) {
        return {
          body: result,
        };
      }

      return new AuthenticationError('Invalid login and password');
    },
  }]
];
