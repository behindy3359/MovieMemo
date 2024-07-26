const dotenv = require('dotenv');
const path = require('path');

const envFile = process.env.NODE_ENV === 'server' ? '../.env.server' : '../.env';

dotenv.config({
  path: path.resolve(__dirname, envFile),
});

const config = {
  "development": {
    "username": process.env.DBUSER,
    "password": process.env.DBPW,
    "database": process.env.DB,
    "host": process.env.DBHOST,
    "dialect": process.env.DBDIALECT,
  },

  "server": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    "port": process.env.DB_PORT
  }
}

module.exports = config;