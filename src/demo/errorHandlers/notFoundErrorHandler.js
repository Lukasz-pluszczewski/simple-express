import { NotFoundError } from '../errors';

export default (error) => {
  if (error instanceof NotFoundError) {
    return {
      status: 404,
      body: { message: 'Not found' },
    };
  }

  return error;
};
