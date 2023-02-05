import { DataSource } from 'typeorm';

export const scytheDb = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'scythe',
  entities:
    process.env.NODE_ENV === 'production'
      ? [`${__dirname}/entities/**/*.js`]
      : [`${__dirname}/entities/**/*.ts`],
  migrations:
    process.env.NODE_ENV === 'production'
      ? [`${__dirname}/migrations/**/*.js`]
      : [`${__dirname}/migrations/**/*.ts`],
  subscribers:
    process.env.NODE_ENV === 'production'
      ? [`${__dirname}/subscribers/**/*.js`]
      : [`${__dirname}/subscribers/**/*.ts`],
});
