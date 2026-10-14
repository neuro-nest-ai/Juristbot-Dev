require('dotenv').config();
const mysql = require('mysql2');
const { getSecret } = require('./valut');
let pool;
async function authenticateAppRoleAndVerifySecret() {
 let secret = await getSecret(process.env.MYSQL_SECRET_PATH);
    if (process.env.NODE_ENV === 'Dev') {
    secret = {
      DB_HOST: "165.232.178.249",
      DB_NAME: "juristbot_dev",
      DB_PASSWORD: "mrN+P<3uQ5Mu",
      DB_PORT: 32020,
      DB_USER: "juristbot_dev",
    };
  }
  const { DB_HOST: host, DB_USER: user, DB_PASSWORD: password, DB_NAME: database, DB_PORT } = secret;

  if (!user || !password || !host || !database) {
    throw new Error('Missing MySQL Vault creds');
  }

  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port: parseInt(DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    dateStrings: true ,
  });

  console.log('✅ MySQL pool created');
  return pool;
}

function getPool() {
  return pool; 
}

module.exports = {
  authenticateAppRoleAndVerifySecret,
  getPool,
};
