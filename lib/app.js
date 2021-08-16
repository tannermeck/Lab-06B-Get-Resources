const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});
app.get('/tires', async(req, res) => {
  try {
    const data = await client.query(' SELECT * FROM tires');
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/dirtbikes', async(req, res) => {
  try {
    const data = await client.query(` SELECT dirtbikes.id, 
                            dirtbikes.brand, 
                            dirtbikes.dirtbike, 
                            tires.brand AS tirebrand
                          FROM dirtbikes INNER JOIN tires 
                          ON dirtbikes.tire_id = tires.id 
                          ORDER BY dirtbikes.id`);
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});
app.get('/dirtbikes/:id', async(req, res) => {
  const dirtbikeId = req.params.id;
  try {
    const data = await client.query(` SELECT dirtbikes.id, 
                              dirtbikes.brand, 
                              dirtbikes.dirtbike, 
                              tires.brand AS tirebrand
                            FROM dirtbikes INNER JOIN tires 
                            ON dirtbikes.tire_id = tires.id
                            WHERE dirtbikes.id = $1`, [dirtbikeId]);
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});
app.post('/dirtbikes', async(req, res) => {
  try{
    const data = await client.query(`INSERT INTO dirtbikes (brand, dirtbike, tire_id) 
    VALUES ($1, $2, $3) 
    RETURNING *`, [req.body.brand, req.body.dirtbike, req.body.tire_id]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
app.put('/dirtbikes/:id', async(req, res) => {
  const id = req.params.id;
  try {
    const data = await client.query('UPDATE dirtbikes SET brand=$1, dirtbike=$2, tire_id=$3 WHERE id = $4 RETURNING *', [req.body.brand, req.body.dirtbike, req.body.tire_id, id]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
