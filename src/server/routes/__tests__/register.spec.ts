import fs from 'fs';
jest.mock('fs');
fs.existsSync.mockReturnValue(true);
fs.readFileSync.mockReturnValue(
  '{"main": {"js": "mocked"}, "vendors": {"js": "mocked"}, "runtime": {"js": "mocked"}}',
);
import { default as request } from 'supertest';
import { server } from '@/server/index';

describe('GET /register', function () {
  it('responds with json', function (done) {
    request(server)
      .get('/register')
      .set('Accept', 'application/json')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
});
