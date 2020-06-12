const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '..', '.env') });

module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'scythe',
  entities:
    process.env.NODE_ENV === 'production'
      ? [`${__dirname}/dist/db/entities/**/*.js`]
      : [`${__dirname}/src/db/entities/**/*.ts`],
  migrations:
    process.env.NODE_ENV === 'production'
      ? [`${__dirname}/dist/db/migrations/**/*.js`]
      : [`${__dirname}/src/db/migrations/**/*.ts`],
  subscribers:
    process.env.NODE_ENV === 'production'
      ? [`${__dirname}/dist/db/subscribers/**/*.js`]
      : [`${__dirname}/src/db/subscribers/**/*.ts`],
  cli: {
    migrationsDir: 'src/db/migrations',
  },
};
