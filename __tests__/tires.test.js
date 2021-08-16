require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');


describe('tire routes', () => {
  
  beforeAll(async () => {
    execSync('npm run setup-db');
  
    await client.connect();
    //   const signInData = await fakeRequest(app)
    //     .post('/auth/signup')
    //     .send({
    //       email: 'jon@user.com',
    //       password: '1234'
    //     });
      
    //   token = signInData.body.token; // eslint-disable-line
  }, 20000);
  
  afterAll(done => {
    return client.end(done);
  });
  test('returns tires with get /tires', async() => {
      
    const expectation = [
      {
        id: 1,
        brand: 'dunlop'
      },
      {
        id: 2,
        brand: 'pirelli'
      }
    ];
        
  
    const data = await fakeRequest(app)
      .get('/tires')
      .expect('Content-Type', /json/)
      .expect(200);
      
    expect(data.body).toEqual(expectation);
      
  });
});