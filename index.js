import express, { Router } from "express";
import http from "http";
import getBuildRoutes from "./src/lib/buildRoutes";
import { createHandler } from "./src/lib/createHandler";
import request from "supertest";

const app = express();
const server = http.createServer(app);
app.server = server;

const router1 = Router({ mergeParams: true });
const router2 = Router({ mergeParams: true });
const router3 = Router();
const router4 = Router();
const router5 = Router();
const router6 = Router();
const router7 = Router();
const router8 = Router();
const router9 = Router();


const buildRoutes = getBuildRoutes({ createHandlerWithParams: createHandler({}, {}), app, stats: { registerEvent: () => {} } });

// const router = buildRoutes({
//   get: () => console.log('route triggered') || ({ status: 201, body: 'works' }),
// });

router2.use('/', (req, res) => res.status(201).send(req.params.foo))
router1.use('/:foo', router2);

app.use(router1);

(async() => {
  await request(app)
    .get('/works')
    .expect(201)
    .expect('works');

})();

// await request(app)
//   .get('/foo/bar')
//   .set('authentication', 'token')
//   .expect(200)
//   .expect('authenticated');
//
// return request(app)
//   .get('/foo/bar')
//   .expect(401)
//   .expect('unauthenticated');
