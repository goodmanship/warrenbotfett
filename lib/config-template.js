const winston = require('winston')

module.exports = {
  logger: winston,
  apiPassphrase: 'x',
  apiKey: 'x',
  apiSecret: 'x',
  apiUrl: 'https://api-public.sandbox.gdax.com',
  // wsUrl: 'wss://ws-feed-public.sandbox.gdax.com',
  defaultProduct: 'ETH-USD',
  mongoUrl: 'mongodb://localhost:27017/warren',
  slackUrl: 'x',
  database: {
    user: 'x', // env var: PGUSER
    database: 'x', // env var: PGDATABASE
    password: 'x', // env var: PGPASSWORD
    host: 'x', // Server hosting the postgres database
    port: 5432, // env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
  }
}
