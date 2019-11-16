import request from 'supertest';
import runApp from '../App';

it('works', async () => {
  const app = await runApp();

  return request(app)
    .get('/')
    .expect(200)
    .expect('works');
});
