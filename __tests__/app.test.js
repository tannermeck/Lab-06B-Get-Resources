require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
const dirtbikes = require('../data/dirtbikes.js');

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
      const expectedBrands = dirtbikes.map(bike => bike.brand);
      const expectation = 
        {
          id: 1,
          brand: 'kawasaki',
          dirtbike: true,
          tirebrand: 'dunlop'
        };
      

      const data = await fakeRequest(app)
        .get('/dirtbikes')
        .expect('Content-Type', /json/)
        .expect(200);
      const brands = data.body.map(item => item.brand);

      expect(brands).toEqual(expectedBrands);
      expect(data.body[0]).toEqual(expectation);
    });
    test('returns dirtbikes with a specific id', async() => {

      const expectation = 
        {
          id: 1,
          brand: 'kawasaki',
          dirtbike: true,
          tirebrand: 'dunlop'
        };

      const data = await fakeRequest(app)
        .get('/dirtbikes/1')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(data.body).toEqual(expectation);
    });
    test('creates a dirtbike', async() => {

      const newDirtbike = 
        {
          brand: 'husquvarna',
          dirtbike: true,
          tire_id: 2
        };

      const data = await fakeRequest(app)
        .post('/dirtbikes').send(newDirtbike)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(data.body.brand).toEqual(newDirtbike.brand);
      expect(data.body.tires).toEqual(newDirtbike.tires);
    });
    test('replaces a dirtbike object information', async() => {

      const updateDirtbike = 
        {
          brand: 'alta',
          dirtbike: false,
          tire_id: 2
        };
      
      
      await fakeRequest(app)
        .put('/dirtbikes/2').send(updateDirtbike)
        .expect(200)
        .expect('Content-Type', /json/);
      const data = await fakeRequest(app)
        .get('/dirtbikes/2')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(data.body.brand).toEqual(updateDirtbike.brand);
      expect(data.body.dirtbike).toEqual(updateDirtbike.dirtbike);
    });
  });
});
