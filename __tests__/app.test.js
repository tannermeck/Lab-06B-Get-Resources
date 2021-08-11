require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 20000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns dirtbikes', async() => {

      const expectation = [
        {
          id: 1,
          brand: 'kawasaki',
          dirtbike: true,
          tires: 'dunlop'
        },
        {
          id: 2,
          brand: 'honda',
          dirtbike: true,
          tires: 'pirelli'
        },
        {
          id: 3,
          brand: 'yamaha',
          dirtbike: true,
          tires: 'pirelli'
        },
        {
          id: 4,
          brand: 'suzuki',
          dirtbike: true,
          tires: 'dunlop'
        },
        {
          id: 5,
          brand: 'ktm',
          dirtbike: true,
          tires: 'dunlop'
        },
      ];

      const data = await fakeRequest(app)
        .get('/dirtbikes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('returns dirtbikes', async() => {

      const expectation = [
        {
          id: 1,
          brand: 'kawasaki',
          dirtbike: true,
          tires: 'dunlop'
        }
      ];

      const data = await fakeRequest(app)
        .get('/dirtbikes/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
