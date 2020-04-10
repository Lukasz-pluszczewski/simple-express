import request from 'supertest';
import simpleExpress from '../../lib';

import routes from '../routes';
import authenticationErrorHandler from '../errorHandlers/authenticationErrorHandler';
import notFoundErrorHandler from '../errorHandlers/notFoundErrorHandler';
import generalErrorHandler from '../errorHandlers/generalErrorHandler';

import getPostsRepository from '../repositories/posts';
import { getToken, token } from '../services/authentication';

describe('Demo app', () => {
  let app;
  let postsMockRepository;

  beforeAll(async () => {
    postsMockRepository = getPostsRepository([
      { id: '1', title: 'Foo', content: 'Lorem ipsum', published: true },
      { id: '2', title: 'Bar', content: 'Dolor', published: false },
    ]);

    app = await simpleExpress({
      port: process.env.PORT || 8080,
      routes: [
        ['/errorendpoint', {
          get: ({ params }) => ({ body: params.nonexistent.param }),
        }],
        ...routes,
      ],
      errorHandlers: [
        authenticationErrorHandler,
        notFoundErrorHandler,
        generalErrorHandler,
      ],
      routeParams: { getToken, postsRepository: postsMockRepository },
    }).then(({ app }) => app);
  });
  afterAll(async () => {
    await app.server.close();
  });

  describe('error handlers', () => {
    it('should return 404 for non existing routes', () => {
      return request(app)
        .get('/no/such/route')
        .set('authentication', 'invalid')
        .expect(404)
        .expect({ message: 'Not found' });
    });
    it('should return 500 for unknown error', () => {
      return request(app)
        .get('/errorendpoint')
        .expect(500)
        .expect({ message: 'Unknown error' });
    })
  });
  describe('login endpoint', () => {
    it('returns user data', async () => {
      return request(app)
        .get('/login')
        .set('authentication', token)
        .expect(200)
        .expect({ user: { username: 'admin' } });
    });
    it('returns error when provided with invalid token', async () => {
      return request(app)
        .get('/login')
        .set('authentication', 'invalid')
        .expect(401)
        .expect({ message: 'Unauthorized' });
    });
    it('returns token when provided with valid credentials', async () => {
      return request(app)
        .post('/login')
        .send({ login: 'admin', password: 'admin' })
        .expect(200)
        .expect({ token, user: { username: 'admin' } });
    });
  });
  describe('GET /posts endpoint', () => {
    it('returns list of published posts', async () => {
      return request(app)
        .get('/posts?published=true')
        .set('authentication', token)
        .expect(200)
        .expect([
          { id: '1', title: 'Foo', content: 'Lorem ipsum', published: true },
        ]);
    });
    it('returns list of unpublished posts', async () => {
      return request(app)
        .get('/posts?published=false')
        .set('authentication', token)
        .expect(200)
        .expect([
          { id: '2', title: 'Bar', content: 'Dolor', published: false },
        ]);
    });
    it('returns error when provided with invalid token', async () => {
      return request(app)
        .get('/posts')
        .set('authentication', 'invalid')
        .expect(401)
        .expect({ message: 'Unauthorized' });
    });
  });
  describe('POST /posts endpoint', () => {
    it('adds a post', async () => {
      await request(app)
        .post('/posts')
        .set('authentication', token)
        .send({ id: '3', title: 'Baz', content: 'Sit amet', published: true })
        .expect(201)
        .expect({ id: '3', title: 'Baz', content: 'Sit amet', published: true });

      expect(postsMockRepository.getById('3')).toEqual({ id: '3', title: 'Baz', content: 'Sit amet', published: true });
    });
    it('returns error when provided with invalid token', async () => {
      return request(app)
        .post('/posts')
        .set('authentication', 'invalid')
        .expect(401)
        .expect({ message: 'Unauthorized' });
    });
  });
  describe('GET /posts/:id endpoint', () => {
    it('returns a post', async () => {
      await request(app)
        .get('/posts/2')
        .set('authentication', token)
        .expect(200)
        .expect({ id: '2', title: 'Bar', content: 'Dolor', published: false });
    });
    it('returns a not found error if post does not exist', async () => {
      await request(app)
        .get('/posts/10')
        .set('authentication', token)
        .expect(404);
    });
    it('returns error when provided with invalid token', async () => {
      return request(app)
        .get('/posts/2')
        .set('authentication', 'invalid')
        .expect(401)
        .expect({ message: 'Unauthorized' });
    });
  });
  describe('PUT /posts endpoint', () => {
    it('updates a post', async () => {
      await request(app)
        .put('/posts/2')
        .set('authentication', token)
        .send({ title: 'Baz edited', content: 'Sit amet edited', published: false })
        .expect(204);

      expect(postsMockRepository.getById('2'))
        .toEqual({ id: '2', title: 'Baz edited', content: 'Sit amet edited', published: false });
    });
    it('returns a not found error if post does not exist', async () => {
      await request(app)
        .put('/posts/10')
        .set('authentication', token)
        .send({ title: 'title', content: 'content', published: false })
        .expect(404);
    });
    it('returns error when provided with invalid token', async () => {
      return request(app)
        .put('/posts')
        .set('authentication', 'invalid')
        .expect(401)
        .expect({ message: 'Unauthorized' });
    });
  });

});
