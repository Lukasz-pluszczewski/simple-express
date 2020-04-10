import { NotFoundError } from '../errors.js';
import protect from '../services/authentication';
import login from './login';
import posts from './posts';

export default [
  login,
  ['/posts', protect, posts],
  ['*', () => new NotFoundError('Not found')]
];
