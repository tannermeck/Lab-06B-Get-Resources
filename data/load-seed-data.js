const client = require('../lib/client');
// import our seed data:
const dirtbikes = require('./dirtbikes.js');
const tires = require('./tires.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
    
    await Promise.all(
      tires.map(tire => {
        return client.query(`
                    INSERT INTO tires (brand)
                    VALUES ($1)
                    RETURNING *;
                `,
        [tire.brand]);
      })
    );
    await Promise.all(
      dirtbikes.map(bike => {
        return client.query(`
                    INSERT INTO dirtbikes (brand, dirtbike, tire_id)
                    VALUES ($1, $2, $3)
                    RETURNING *;
                `,
        [bike.brand, bike.dirtbike, bike.tire_id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
