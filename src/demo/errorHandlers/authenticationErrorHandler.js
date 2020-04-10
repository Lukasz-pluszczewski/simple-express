import { AuthenticationError } from '../errors';

export default (error) => {
  if (error instanceof AuthenticationError) {
    return {
      status: 401,
      body: { message: 'Unauthorized' },
    };
  }

  return error;
};
