module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'scythe',
  entities: [`${__dirname}/src/db/entities/**/*.ts`],
  migrations: [`${__dirname}/src/db/migrations/**/*.ts`],
  subscribers: [`${__dirname}/src/db/subscribers/**/*.ts`],
  cli: {
    migrationsDir: 'src/db/migrations'
  }
};
