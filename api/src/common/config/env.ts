export const DB_NAME = process.env.DB_NAME || 'scythe';
export const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = Number(process.env.DB_PORT) || 5432;

export const API_SERVER_PORT = process.env.API_SERVER_PORT || 4000;

export const GRAPHQL_SERVER_BASIC_AUTH =
  process.env.GRAPHQL_SERVER_BASIC_AUTH || '';
