module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'scythe',
  entities: [`${__dirname}/src/db/entities/**/*.ts`],
  migrations: [`${__dirname}/src/db/migrations/**/*.ts`],
  subscribers: [`${__dirname}/src/db/subscribers/**/*.ts`],
  cli: {
    migrationsDir: 'src/db/migrations'
  }
};
