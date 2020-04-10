import { AuthenticationError } from '../errors';

export const token = 'someFakeToken';

export default ({ getHeader, locals, next }) => {
  if (getHeader('authentication') === token) {
    locals.user = { username: 'admin' };
    return next();
  }

  return new AuthenticationError('Token invalid');
};

export const getToken = (login, password) => {
  if (login === 'admin' && password === 'admin') {
    return {
      user: { username: 'admin' },
      token,
    }
  }
  return false;
};
